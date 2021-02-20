import { Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
const { appSecret } = require('../config/keys');
const secret = appSecret;

const withAuth = function(req: any, res: Response, next: NextFunction) {
  const token = 
      req.body.token ||
      req.query.token ||
      req.headers['x-access-token'] ||
      req.cookies.token;

  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function(err: any, decoded: any) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
}

export = withAuth;