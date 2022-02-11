const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const session = require("express-session");
const PostgreSqlStore = require('connect-pg-simple')(session);
const passport = require('passport')
require('dotenv').config();
const stripe = require("stripe")(process.env.NODE_STRIPE_SK);
const {query, db} = require('./db');
const moment = require('moment');
const {configPassport, ensureAuthenticated} = require('./auth');
const bcrypt = require('bcryptjs');
const sendEmail = require('./email');

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


app.get('/details', (req, res) => {
    query(`
        SELECT *, CAST((product.qty - (SELECT COUNT(*) FROM transactions)) AS int) AS available_qty
        FROM details
                 JOIN product ON product.id = details.id`)
        .then(rows => {
            res.json(rows[0]);
            res.end();
        })
        .catch(err => console.log(err))
})

app.post('/details', (req, res) => {
    query('UPDATE details VALUES ? WHERE id=1', [res.body])
        .then(rows => {
            res.json(rows[0]);
            res.end();
        })
        .catch(err => console.log(err))
})

app.get('/admin', (req, res) => {
    if (req.isAuthenticated())
        res.status(200).json({
            isAuthenticated: true,
            user: req.user
        });
    else
        res.json({
            isAuthenticated: false,
            user: null
        });
});

app.post('/admin', (req, res) => {
    passport.authenticate('local', {}, (error, user) => {
        console.log({error, user})
        if (error) {
            res.json({isAuthenticated: false, ...error, user: user})
            res.end()
            return;
        }

        req.login(user, (err, user) => {
            res.status(200).json({isAuthenticated: true, user: user});
            res.end();
        })
    })(req, res);
});

const hashPass = (pass) =>
    bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(pass, salt))
        .catch(err => console.log(err))


app.post('/create-admin', ensureAuthenticated, (req, res) => {
    const {username, password, firstname, lastname} = req.body;

    // Check if user exists
    query('SELECT * FROM users WHERE username=$1', [username])
        .then(rows => {
            // If we get a result that means the email is already registered
            if (rows.length) {
                res.json({error: 'User exists'});
                res.end()
                return
            }

            hashPass(password)
                .then(hashedPass =>
                    query('INSERT INTO users(username, pass, firstname, lastname) VALUES ($1, $2, $3, $4)',
                        [username, hashedPass, firstname, lastname])
                )
                .then(_ => {
                    res.status(200).json({success: true})
                    res.end()
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.error(err))
});


app.post('/updated-account', ensureAuthenticated, (req, res) => {
    const userId = req.user.id
    const {
        currentUsername,
        username,
        firstname,
        lastname,
        currentPass,
        newPass,
        confirmPass
    } = req.body;

    if ((!username || username.length < 2) ||
        (newPass && newPass.length < 8) ||
        (newPass !== confirmPass) ||
        (!currentPass)) {
        res.json({error: 'Failed to save. Missing inputs.'})
        res.end()
        return;
    }

    let savePass = currentPass;
    if (newPass) savePass = newPass;

    // Check if user exists
    query('SELECT * FROM users WHERE id=$1', [userId])
        .then(rows => {
            const {pass} = rows[0]

            bcrypt.compare(currentPass, pass)
                .then(isMatch => {
                    if (!isMatch) {
                        res.json({error: 'Incorrect Password'});
                        res.end();
                        return;
                    }

                    hashPass(savePass)
                        .then(hashedPass =>
                            query(`UPDATE users
                                   SET pass=$1,
                                       username=$2,
                                       firstname=$3,
                                       lastname=$4
                                   WHERE id = $5`,
                                [hashedPass, username, firstname, lastname, userId])
                        )
                        .then(_ => {
                            res.status(200).json({error: false})
                            res.end()
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.error(err));


        })
        .catch(err => {
            console.error(err);
            res.status(500).end()
        })
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/admin');
});

app.post('/payment-success', (req, res) => {
    const {id, created, eventData, userData} = req.body;

    query(`UPDATE transactions
           SET purchased_on=to_timestamp($1),
               purchase_confirmed= TRUE
           WHERE transaction_id = $2`, [created, id])
        .then(_ => query('SELECT * FROM transactions WHERE transaction_id=$1', [id]))
        .then(rows => {
            const ticketId = rows[0].ticket_id

            console.log({
                ticketId,
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
                product: userData.product,
                qty: userData.qty,
                price: userData.price,
                tipAmount: Number(userData.tipAmount),
                total: userData.total,
                date_time: eventData.date_time,
                venue: eventData.venue
            })

            sendEmail({
                ticketId,
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
                product: userData.product,
                qty: userData.qty,
                price: userData.price,
                tipAmount: Number(userData.tipAmount),
                total: userData.total,
                date_time: eventData.date_time,
                venue: eventData.venue,
                title: eventData.title
            })
                .then(({accepted}) => {
                    if (!accepted) return;
                    return query(
                        `UPDATE transactions
                         SET email_sent= TRUE
                         WHERE transaction_id = $2`, [id])
                })
                .catch(console.error)

            res.status(200).json({ticket: ticketId})
            res.end();
        })
        .catch(err => console.log(err))
})

app.post("/create-payment-intent", (req, res) => {

    const {price, qty, email, firstname, lastname, tipAmount} = req.body;
    const total = (qty * price) + tipAmount

    query('SELECT * FROM product')
        .then(rows => {
            const product = rows[0]

            if (product.price !== price || qty < 1) {
                res.status(400).json({error: "Price doesn't matched with the stored price."})
                res.end();
                return;
            }

            return stripe.paymentIntents.create({
                amount: total * 100,
                currency: "usd",
                payment_method_types: ['card'],
                receipt_email: email,
                description: `${firstname} ${lastname}`
            });
        })
        .then(paymentIntent => {

            const ticketId = `${firstname}_${lastname}_${paymentIntent.id.split('_')[1]}`

            query(`INSERT INTO transactions(firstname, lastname, price, ticket_id, email, transaction_id, qty,
                                            total_paid, tip)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [firstname, lastname, price, ticketId, email, paymentIntent.id, qty, total, tipAmount])
                .then(userSaved => console.log(userSaved))
                .catch(console.error)

            res.json({
                clientSecret: paymentIntent.client_secret
            });
        })
        .catch(console.error)

});

app.get('/transactions', ensureAuthenticated, (req, res) => {
    query('SELECT * FROM transactions')
        .then(rows => {
            res.status(200).json(rows)
            res.end()
        })
        .catch(err => {
            console.log(err);
            res.status(500);
            res.end()
        })
});


app.listen(5000, () => console.log('Running on http://localhost:5000'));