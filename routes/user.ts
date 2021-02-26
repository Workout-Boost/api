import { Router, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
const bcrypt = require('bcryptjs');
const withAuth = require('./middleware');
const { appSecret } = require('../config/keys');

const secret: string = appSecret;

const user = (app: Router) => {
    app.get('/home', function(req: Request, res: Response) {
        res.send('Welcome!');
    });
      
    app.get('/user/profile', withAuth, async function(req: Request, res: Response) {
        const token: string = 
            req.body.token ||
            req.query.token ||
            req.headers['x-access-token'] ||
            req.cookies.token;  
        
        const decoded: any = jwt.verify(token, appSecret);

        User.findById(decoded.id, function(err: any, user: any) {
            return res.status(200).json({
                email: user.email,
                password: user.password
            });
        })
    });
      
    app.post('/user/register', function(req: Request, res: Response) {
        const { username, email, password } = req.body;
        const user: any = new User({ username, email, password, bio: 'No Bio', shared: 0 });
        user.save(function(err: any) {
            if (err) {
            console.log(err);
            res.status(500).send("Error registering new user please try again.");
            } else {
            res.status(200).send("Registered!");
            }
        });
    });
      
    app.post('/user/login', function(req: Request, res: Response) {
        const { email, password } = req.body;
        User.findOne({ email }, function(err: any, user: any) {
            if (err) {
            console.error(err);
            res.status(500)
                .json({
                error: 'Internal error please try again'
            });
            } else if (!user) {
            res.status(401)
                .json({
                error: 'Incorrect email or password'
            });
            } else {
            user.isCorrectPassword(password, function(err: any, same: boolean) {
                if (err) {
                res.status(500)
                    .json({
                    error: 'Internal error please try again'
                });
                } else if (!same) {
                res.status(401)
                    .json({
                    error: 'Incorrect email or password'
                });
                } else {
                // Issue token
                const payload: object = {
                    id: user._id,
                    email,
                };
                const token: string = jwt.sign(payload, secret, {
                    expiresIn: '7d'
                });
                res.cookie('token', token, { httpOnly: true }).sendStatus(200);
                }
            });
            }
        });
    });

    app.patch('/user/update', withAuth, async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const token: string = 
            req.body.token ||
            req.query.token ||
            req.headers['x-access-token'] ||
            req.cookies.token;  
        
        const decoded: any = jwt.verify(token, appSecret);

        const updateQuery: any = {};

        if (email) updateQuery.email = email;
        if (password) updateQuery.password = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(decoded.id, updateQuery);

        return res.status(200).send("Updated!");
    })

    app.get('/user/logout', function(req: Request, res: Response) {
        res.cookie('token', "", { httpOnly: true }).sendStatus(200);
    });
      
    app.get('/checkToken', withAuth, function(req: Request, res: Response) {
        res.sendStatus(200);
    });
};

module.exports = user;