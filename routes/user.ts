import { Router, Request, Response} from 'express'
import User from '../models/User'
import jwt from 'jsonwebtoken'
const bcrypt = require('bcryptjs');
const withAuth = require('./middleware');
const { appSecret } = require('../config/keys');

const secret = appSecret;

const user = (app: Router) => {
    app.get('/home', function(req: Request, res: Response) {
        res.send('Welcome!');
    });
      
    app.get('/user/profile', withAuth, async function(req: Request, res: Response) {
        const token = 
            req.body.token ||
            req.query.token ||
            req.headers['x-access-token'] ||
            req.cookies.token;  
        
        const decoded: any = jwt.verify(token, appSecret);

        User.findById(decoded.id, function(err: string, user: any) {
            return res.status(200).json({
                email: user.email,
                password: user.password
            });
        })
    });
      
    app.post('/user/register', function(req, res) {
        const { email, password } = req.body;
        const user = new User({ email, password });
        user.save(function(err: any) {
            if (err) {
            console.log(err);
            res.status(500).send("Error registering new user please try again.");
            } else {
            res.status(200).send("Registered!");
            }
        });
    });
      
    app.post('/user/login', function(req, res) {
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
            user.isCorrectPassword(password, function(err: any, same: any) {
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
                const payload = {
                    id: user._id,
                    email,
                };
                const token = jwt.sign(payload, secret, {
                    expiresIn: '7d'
                });
                res.cookie('token', token, { httpOnly: true }).sendStatus(200);
                }
            });
            }
        });
    });

    app.patch('/user/update', withAuth, async (req, res) => {
        const { email, password } = req.body;
        const token = 
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

    app.get('/user/logout', function(req, res) {
        res.cookie('token', "", { httpOnly: true }).sendStatus(200);
    });
      
    app.get('/checkToken', withAuth, function(req, res) {
        res.sendStatus(200);
    });
};

module.exports = user;