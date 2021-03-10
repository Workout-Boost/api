import { Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import Cookies from 'universal-cookie';
const { appSecret } = require('../config/keys');
const secret = appSecret;

export const withAuth = function(req: any, res: Response, next: NextFunction) {
  const cookies = new Cookies(req.headers.cookie);
  const token: string = cookies.get('token')

  console.log(token)
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function(err: any, decoded: any) {
      if (err) {
        res.status(403).send('Unauthorized: Invalid token');
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
}

export const isAdmin = function(req: any, res: Response, next: NextFunction) {
  const token: string = 
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
        if (decoded.id === '6046ff329c648230431fd533' || "6046d11821607e1a173cd08e") {
          req.email = decoded.email;
          next();
        }
      }
    });
  }
}