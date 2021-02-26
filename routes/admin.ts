import { Router, Request, Response} from 'express'
import User from '../models/User'

const admin = (app: Router) => {
    // Get all users 
    app.get('/admin/users', async function(req: Request, res: Response) {
        try {
            const users: object = await User.find();
            res.json(users)
        } catch (err) {
            res.send(`Error ${err}`)
        }
    });
    // Delete user
    app.delete('/admin/:userId', async (req: Request, res: Response) => {
        try {
            await User.deleteOne({_id: req.params.userId});
            const users: object = await User.find();
            res.json(users)
        } catch (err) {
            res.send(`Error ${err}`)
        }
    })
};

export = admin;