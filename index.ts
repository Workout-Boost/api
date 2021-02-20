import express, { Request, Response} from 'express'
import db from './config/db'
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors')
const fs = require('fs')
const PORT: number = 8080

const app: express.Application = express();
// Initializes the database
db();

app.use(cors());
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