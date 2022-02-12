const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const session = require("express-session");
const PostgreSqlStore = require('connect-pg-simple')(session);
const passport = require('passport')
require('dotenv').config();
const {db} = require('./db');
const moment = require('moment');
const {configPassport} = require('./auth');
const path = require("path");
const httpsRedirect = require('./express-middleware/https-redirect');

app.use(httpsRedirect())

app.use(express.static("public/build"));
app.use(express.static("public"));
configPassport(passport);

app.use((req, res, next) => {
    console.log(`[${moment().format("MMM DD, YYYY Thh:mm:ss")}]: ${req.method} | ${req.originalUrl} `);
    next();
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // ENABLE ONLY ON HTTPS
        maxAge: 14400000
    },
    store: new PostgreSqlStore({
        pool: db,
        createTableIfMissing: true
    })
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', require('./routes/api'));

// Send index.html and let React handle routes
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, "./public/build/index.html"))
});

app.listen(process.env.PORT, () =>
    console.log(`Running on http://localhost:${process.env.PORT}`));