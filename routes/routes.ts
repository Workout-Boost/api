import { Router, Request, Response} from 'express'
const user = require('./user');

const appRouter: any = (app: Router, fs: any) => {
    app.get('/', (req: Request, res: Response) => {
        res.send(`<h1>Current working routes:</h1>`);
        res.end();
    })
    // Routes
    user(app);
}

export = appRouter;