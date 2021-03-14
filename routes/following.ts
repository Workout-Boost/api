import { Router, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import Post from '../models/Post'
import User from '../models/User'
const {withAuth} = require('./middleware');
const { appSecret } = require('../config/keys');

const following = (app: Router) => {
    // Add Saved post to user
    app.post('/following', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            // Add user id to following array
            await User.updateOne(
                { _id : decoded.id},
                { $push: {
                    following: req.body.userId
                }
            }).exec();
            // Add follower to user following
            await User.updateOne(
                { _id: req.body.userId },
                { $push: {
                    followers: decoded.id
                }
            }).exec();
            // Checks who user is following
            await User.findById(decoded.id, function(err: any, user: any) {
                res.status(200).json(user.following)
            })
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Check who the user is following
    app.get('/followingWho', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            // Checks who user is following
            await User.findById(decoded.id, function(err: any, user: any) {
                res.status(200).json(user.following)
            })
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Get Posts from a following user
    app.get('/following', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            User.findById(decoded.id, function(err: any, user: any) {
                Post.find({postUid:{$in:user.following}})
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
    // Unfollow user
    app.delete('/unfollow/:userId', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token; 
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            // Removes followed user id from following
            await User.updateOne(
                { _id : decoded.id},
                { $pull: {
                    following: req.params.userId
                }
            }).exec();
            // Remove follower to user following
            await User.updateOne(
                { _id: req.params.userId },
                { $pull: {
                    followers: decoded.id
                }
            }).exec();
            // Checks who user is following
            await User.findById(decoded.id, function(err: any, user: any) {
                res.status(200).json(user.following)
            })
        } catch (error) {
            res.status(500).send('Internal Error, Please try again')
        }
    })
    // Following List
    app.get('/followingList', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            User.findById(decoded.id, function(err: any, user: any) {
                User.find({_id:{$in:user.following}})
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
    // Followers List
    app.get('/followersList', withAuth, async (req: Request, res: Response) => {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        try {
            User.findById(decoded.id, function(err: any, user: any) {
                User.find({_id:{$in:user.followers}})
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

export = following;