const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config()

const connectDB = require('./db');
const { getUser } = require('./middleware');

//routes
const route = require('./routes/route');
const beta = require('./routes/beta');
const user = require('./routes/user');

const app = express();
const port = process.env.PORT || 5000;

const sessionLength = parseInt(process.env.SESSION_LENGTH) || (1000 * 60 * 60 * 24);
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: sessionLength,
    sameSite: true
  },
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}

if (process.env.ENV === 'PRODUCTION') {
  sessionConfig.cookie.secure = true;
  sessionConfig.store = MongoStore.create({ mongoUrl: process.env.DB_URL })
}

app.use(express.json());
app.use(session(sessionConfig));
app.use(getUser);

app.use('/routes', express.static('images'));
app.use('/routes', route);
app.use('/beta', beta);
app.use('/user', user);

connectDB();

app.listen(port, () => console.log(`Server running on port ${port}`));
