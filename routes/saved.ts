import { Router, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import Post from '../models/Post'
import User from '../models/User'
const {withAuth} = require('./middleware');
const { appSecret } = require('../config/keys');

const saved = (app: Router) => {
    // Add Saved post to user
    app.post('/saved', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            // Save to user
            await User.updateOne(
                { _id : decoded.id},
                { $push: {
                    saved: req.body.postId
                }
            }).exec();
            // Add SavedByOther to post user
            await User.updateOne(
                { _id: req.body.postUid },
                { $inc: { savedByOthers: 1} }
            )
            res.status(200).send('Added to [SAVED]')
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Get Saved Posts from a user
    app.get('/saved', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            User.findById(decoded.id, function(err: any, user: any) {
                Post.find({_id:{$in:user.saved}})
                .sort({createdAt: 'desc'})
                .then(
                    (resp: object)=> {
                        res.status(200).json(resp)
                    }
                )
            })
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Delete Saved
    app.delete('/saved/:postId', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token; 
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            await User.updateOne(
                { _id : decoded.id},
                { $pull: {
                    saved: req.params.postId
                }
            }).exec();
    
            await User.findById(decoded.id, function(err: any, user: any) {
                Post.find({_id:{$in: user.saved}})
                .sort({createdAt: 'desc'})
                .then(
                    (resp: object)=> {
                        res.status(200).json(resp)
                    }
                )
            })
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
};

export = saved;