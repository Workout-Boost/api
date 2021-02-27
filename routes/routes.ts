import { Router, Request, Response} from 'express'
const user = require('./user');
const post = require('./post');
const saved = require('./saved');
const admin = require('./admin')

const appRouter: any = (app: Router, fs: any) => {
    app.get('/', (req: Request, res: Response) => {
        res.send(`<h1>Current working routes:</h1>`);
        res.end();
    })
    // Routes
    user(app);
    post(app);
    saved(app);
    admin(app);
}

export = appRouter;