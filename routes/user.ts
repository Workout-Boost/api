import { Router, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
const bcrypt = require('bcryptjs');
const mailer = require("nodemailer");
const {withAuth} = require('./middleware');
const { appSecret, emailPassword } = require('../config/keys');

const secret: string = appSecret;

const user = (app: Router) => {
    app.get('/home', function(req: Request, res: Response) {
        res.send('Welcome!');
    });
    // Get user profile
    app.get('/user/profile', withAuth, async function(req: Request, res: Response) {
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        User.findById(decoded.id, function(err: any, user: any) {
            return res.status(200).json({
                username: user.username,
                email: user.email,
                password: user.password,
                bio: user.bio,
                avatar: user.avatar,
                id: user._id,
                shared: user.shared,
                savedByOthers: user.savedByOthers
            });
        })
    });
    // Register user
    app.post('/user/register', function(req: Request, res: Response) {
        const { username, email, password } = req.body;
        const user: any = new User({ username, email, password, bio: 'No Bio', avatar: 'bolt', following: [], shared: 0, saved: [], savedByOthers: 0, isVerified: false });
        if (username.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g)) {
            res.status(406).send("Please do not include special characters in username")
        } else if (username.length >= 10) {
            res.status(406).send("Username has to be less then 10 characters")
        } else {
            user.save(function(err: any) {
                if (err) {
                console.log(err);
                res.status(500).send("A user already exists with this username or email");
                } else {
                    let transporter = mailer.createTransport({
                        service: 'gmail',
                        type: "SMTP",
                        host: "smtp.gmail.com",
                        secure: true,
                        auth: {
                          user: 'no.reply.workoutboost@gmail.com', // make sure this email lesssecure! (https://myaccount.google.com/lesssecureapps)
                          pass: emailPassword
                        }
                    });
                      
                    let mail = {
                        from: 'no.reply.workoutboost@gmail.com',
                        to: email,
                        subject: 'Workout Boost - Verification',
                        html: `<h2>Here's your verification link:</h2><br/><a href="https://workoutboost.net/verify/${email}">Click Here: https://workoutboost.net/verify</a>`
                      };
                      
                    transporter.sendMail(mail, function(error: any, info: any){
                        if (error) {
                            console.log(error);
                            res.status(400).send("Your verification email did not send. Please contact admin@workoutboost.net")
                        } else {
                            res.status(200).send("Registered! Check email for verification step");
                        }
                    });
                }
            });
        }
    });
    // User Login
    app.post('/user/login', function(req: Request, res: Response) {
        const { email, password } = req.body;
        User.findOne({ email }, function(err: any, user: any) {
            if (err) {
            console.error(err);
            res.status(500)
                .send('Internal error please try again');
                console.log(err)
            } else if (!user) {
            res.status(401)
                .send('There is no user with that email');
            } else {
            user.isCorrectPassword(password, function(err: any, same: boolean) {
                if (err) {
                res.status(500)
                    .send('Internal error please try again');
                    console.log(err)
                } else if (!same) {
                res.status(401)
                    .send('Incorrect email or password');
                } else {
                // Issue token
                const payload: object = {
                    id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    email,
                };
                const token: string = jwt.sign(payload, secret, {
                    expiresIn: '200d'
                });
                res.status(200).send(token);
                }
            });
            }
        });
    });
    // Update User
    app.patch('/user/update', withAuth, async (req: Request, res: Response) => {
        const { username, email, password, bio } = req.body;
        const token: any = req.query.token;
        
        const decoded: any = jwt.verify(token, appSecret);

        const updateQuery: any = {};

        if (username) updateQuery.username = username;
        if (email) updateQuery.email = email;
        if (password) updateQuery.password = await bcrypt.hash(password, 10);
        if (bio) updateQuery.bio = bio;

        if (username.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g)) {
            res.status(406).send("Please do not include special characters in username")
        } else if (username.length >= 10) {
            res.status(406).send("Username must be less then 10 characters")
        } else if (bio.length >= 100) {
            res.status(406).send("Bio must be less then 100 characters")
        } 
        else {
            try {
                await User.findByIdAndUpdate(decoded.id, updateQuery);
                return res.status(200).send("Updated!");
            } catch (error) {
                return res.status(500).send('Internal Error, Please try again')
            }
        }
    })
    // Complete Verification
    app.post('/user/verify/:email', async (req: Request, res: Response) => {
        try {
            await User.findOneAndUpdate(
                { email: req.params.email },
                { $set:
                   {
                     isVerified: true
                   }
                })
            return res.status(200).send("Verification Complete!");
        } catch (error) {
            return res.status(500).send('Internal Error, Please try again')
        }
    })
    // Get User Id
    app.get('/user/getUserInfo', async (req: Request, res: Response) => {
        const token: any = req.query.token;

        if (token) {
            const decoded: any = jwt.verify(token, appSecret);
            return res.json({
                userId: decoded.id,
                username: decoded.username,
                avatar: decoded.avatar
            });
        } else {
            return res.send(null)
        }
    })
    // Check token with middleware
    app.get('/checkToken', withAuth, function(req: Request, res: Response) {
        res.sendStatus(200);
    });
};

module.exports = user;