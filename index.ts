import express, { Request, Response} from 'express'
import db from './config/db'
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors')
const fs = require('fs')
const PORT: any = process.env.PORT || 8080
// All the setup for api
const app: express.Application = express();
// Initializes the database
db();
const corsOptions = {
  origin: [
    "http://localhost:3000"
  ],
  credentials: true,
  exposedHeaders: ["token"]
}
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