import { Router, Request, Response} from 'express'
const {isAdmin} = require('./middleware');
import User from '../models/User'
import Post from '../models/Post'

const admin = (app: Router) => {
    // Get all users 
    app.get('/admin/users', isAdmin, async (req: Request, res: Response) => {
        try {
            const users: object = await User.find();
            res.json(users)
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    });
    // Delete user
    app.delete('/admin/:userId', async (req: Request, res: Response) => {
        try {
            await User.deleteOne({_id: req.params.userId});
            const users: object = await User.find();
            res.json(users)
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Get all posts
    app.get('/admin/posts', isAdmin, async (req: Request, res: Response) => {
        try {
            const posts: object = await Post.find()
            .sort({createdAt: 'desc'});
            res.json(posts)
        } catch (err) {
            res.status(500).send('Internal Error, Please try again')
        }
    });
    // Delete post
    app.delete('/admin/posts/:postId', async (req: Request, res: Response) => {
        try {
            await Post.deleteOne({_id: req.params.postId});
            try {
                const posts: object = await Post.find()
                .sort({createdAt: 'desc'});
                res.json(posts)
            } catch (err) {
                res.status(500).send('Internal Error, Please try again')
            }
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Delete Comment
    app.delete('/admin/posts/comment/:postId', async (req: Request, res: Response) => {
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
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
};

export = admin;