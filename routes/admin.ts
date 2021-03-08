import { Router, Request, Response} from 'express'
const bcrypt = require('bcryptjs');
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
    // Update User
    app.patch('/admin/user/update/:userId', async (req: Request, res: Response) => {
        const { category, input } = req.body;

        const updateQuery: any = {};

        if (category === "password") {
            updateQuery.password = await bcrypt.hash(input, 10);
        } else {
            updateQuery[category] = input;
        }

        console.log(updateQuery)

        try {
            await User.findByIdAndUpdate(req.params.userId, updateQuery);
            return res.status(200).send("Updated!");
        } catch (error) {
            return res.status(500).send('Internal Error, Please try again')
        }
    })
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