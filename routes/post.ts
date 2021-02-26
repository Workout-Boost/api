import { Router, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import Post from '../models/Post'
const withAuth = require('./middleware');
const { appSecret } = require('../config/keys');
// Post endpoints => anything related to posting
const posts = (app: Router) => {
    const findPosts = async (req: Request, res: Response) => {
        try {
            const posts: object = await Post.find()
            .sort({createdAt: 'desc'});
            res.json(posts)
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    }
    app.get('/posts', async (req: Request, res: Response) => {
        findPosts(req, res);
    });
    // Submits a post - Needs to be req.json to submit
    app.post('/posts', withAuth, async (req: Request, res: Response) => {
        const token: string = 
            req.body.token ||
            req.query.token ||
            req.headers['x-access-token'] ||
            req.cookies.token;

        const decoded: any = jwt.verify(token, appSecret);

        const post: object | any = new Post({
            title: req.body.title,
            description: req.body.description,
            comments: [],
            postUid: decoded.id,
        });

        try {
            await post.save();
            findPosts(req, res);
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    });
    // Specific post
    app.get('/posts/:postId', async (req: Request, res: Response) => {
        try {
            const post: object = await Post.findById(req.params.postId)
            .sort({createdAt: 'desc'})
            res.status(200).json(post)
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Delete post
    app.delete('/posts/:postId', async (req: Request, res: Response) => {
        try {
            await Post.deleteOne({_id: req.params.postId});
            findPosts(req, res);
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Update post
    app.patch('/posts/:postId', async (req: Request, res: Response) => {
        try {
            const updatedPost: object = await Post.updateOne(
                {_id:req.params.postId},
                {$set: {title:req.body.title}}
            );
            res.json(updatedPost);
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Post Comment
    app.post('/posts/comment/:postId', withAuth, async (req: Request, res: Response) => {
        const token: string = 
            req.body.token ||
            req.query.token ||
            req.headers['x-access-token'] ||
            req.cookies.token;  
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            Post.updateOne(
                { _id : req.params.postId},
                { $push: {
                    comments: {
                        commentUid: decoded.id,
                        postUid: req.body.postUid,
                        postId: req.body.postId,
                        comment: req.body.comment
                    }
                }
            }).exec();
            findPosts(req, res);
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Delete Comment
    app.delete('/posts/comment/:postId', withAuth, async (req: Request, res: Response) => {
        try {
            Post.updateOne(
                { _id : req.params.postId},
                { $pull: {
                    comments: {
                        commentUid: req.body.commentUid,
                        postId: req.body.postId,
                        comment: req.body.comment
                    }
                }
            }).exec();
            findPosts(req, res);
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Get Users Posts
    app.get('/userPosts/:userId', async (req: Request, res: Response) => {
        try {
            const post: object = await Post.find({ postUid: req.params.userId })
            .sort({createdAt: 'desc'});
            res.status(200).json(post)
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
};

module.exports = posts;