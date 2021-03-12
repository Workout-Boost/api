import { Router, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
const Meta = require('html-metadata-parser')
import Post from '../models/Post'
import User from '../models/User'
const {withAuth} = require('./middleware');
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
        const token: any = req.query.token;

        const decoded: any = jwt.verify(token, appSecret);

        let expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
        let link = req.body.description.match(expression);

        let image: any | undefined;
        let description: string = req.body.description;

        if (link) {
            image = await Meta.parser(link[0]);
            image = image.og.image

            description = req.body.description.replace(link[0], '<a href="' + link[0] + '">' + link[0] + '</a>')   
        }

        User.findOne({ _id: decoded.id }, async function(err: any, user: any) {
            if (user.isVerified === true) {
                const post: object | any = new Post({
                    username: user.username,
                    avatar: user.avatar,
                    description,
                    image,
                    comments: [],
                    postUid: decoded.id,
                });
    
                try {
                    await post.save();
                    await User.updateOne(
                        { _id: decoded.id },
                        { $inc: { shared: 1} }
                    )
                    findPosts(req, res);
                } catch (error) {
                    res.status(500).send('Internal Error, Please try again')
                }
            } else {
                res.status(401).send("You can't post yet! \nclick link attached to verification email sent to you")
            }
        })
    });
    // Find all post in a category
    app.get('/posts/keyword/:keyword', async (req: Request, res: Response) => {
        let keywords = new RegExp(req.params.keyword);
        if (req.params.keyword === "Upper")
            keywords = /chest|shoulder|upper|Chest|Shoulder|Upper/
        if (req.params.keyword === "Lower")
            keywords = /quads|thighs|Quads|Thighs|lower|Lower/
        if (req.params.keyword === "Nutrition")
            keywords = /health|smoothies|Health|Smoothies|nutrition|Nutrition/

        try {
            Post.find({ description: {$in: keywords }})
            .sort({createdAt: 'desc'})
            .then(
                (resp: object)=> {
                    res.status(200).json(resp)
                }
            )
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Delete post
    app.delete('/posts/:postId', async (req: Request, res: Response) => {
        const token: any = req.query.token;

        const decoded: any = jwt.verify(token, appSecret);

        try {
            await Post.deleteOne({_id: req.params.postId});
            await User.updateOne(
                { _id: decoded.id },
                { $inc: { shared: -1} }
            )
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
                {$set: {title:req.body.description}}
            );
            res.json(updatedPost);
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Post Comment
    app.post('/posts/comment/:postId', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        User.findOne({ _id: decoded.id }, async function(err: any, user: any) {
            if (user.isVerified === true) {
                try {
                    Post.updateOne(
                        { _id : req.params.postId},
                        { $push: {
                            comments: {
                                commentUid: decoded.id,
                                username: user.username,
                                postUid: req.body.postUid,
                                postId: req.body.postId,
                                comment: req.body.comment
                            }
                        }
                    }).exec();
                    res.status(200).send('Comment Posted')
                } catch (error) {
                    res.status(500).send('Internal Error, Please try again')
                }
            } else {
                res.status(401).send("You can't comment yet! \nclick link attached to verification email sent to you")
            }
        })
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
            res.status(200).send('Comment Deleted')
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Get Users Posts
    app.get('/userPosts/:userId', async (req: Request, res: Response) => {
        try {
            User.findById(req.params.userId, async function(err: any, user: any) {
                const post: object = await Post.find({ postUid: req.params.userId })
                .sort({createdAt: 'desc'});
                return res.status(200).json({
                    post,
                    avatar: user.avatar,
                    username: user.username,
                    bio: user.bio,
                    id : user._id
                });
            })
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
};

export = posts;