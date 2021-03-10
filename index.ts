import express, { Request, Response} from 'express'
import db from './config/db'
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors')
const fs = require('fs')
const PORT: any = process.env.PORT || 8080
// All the setup for api
const app: express.Application = express();
// Initializes the database.
db();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://workoutboost.net"
  ],
  credentials: true,
  allowedHeaders: '*',
  exposedHeaders: '*',
}
app.set('trust proxy', 1)
app.use(
    session({
      name: 'session',
      secret: 'secret',
      resave: true,
      rolling: true,
      saveUninitialized: false,
      proxy: true,
      unset: "destroy",
      cookie: {
        httpOnly: true,
        path: "/",
        secure: true,
        maxAge: 200000
      }
    })
  )  
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req: Request, res: Response) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

require('./routes/routes')(app, fs)

app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`)
})