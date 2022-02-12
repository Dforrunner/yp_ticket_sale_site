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
const format = require('pg-format');
const path = require("path");

app.use(express.static(path.join(__dirname, "client/build")));
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


/**
 * Queries and returns all details from the details DB table
 */
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

/**
 * Updated details DB table
 */
app.post('/details', (req, res) => {
    query('UPDATE details VALUES ? WHERE id=1', [res.body])
        .then(rows => {
            res.json(rows[0]);
            res.end();
        })
        .catch(err => console.log(err))
})

/**
 * Endpoint used to confirm the user is still logged in
 */
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

/**
 * Admin panel login endpoint
 */
app.post('/admin', (req, res) => {
    passport.authenticate('local', {}, (error, user) => {
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

/**
 * Salt and hash password string using bcrypt
 * @param pass
 * @return hash
 */
const hashPass = (pass) =>
    bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(pass, salt))
        .catch(err => console.log(err))


/**
 * Create new admin and store them into the DB
 */
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

/**
 * Update admin account endpoint
 */
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

/**
 * Auth logout endpoint
 */
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/admin');
});

/**
 * Handle successful payment
 * - Update transaction table to confirm payment has been made
 * - Email the user their ticket
 */
app.post('/payment-success', (req, res) => {
    const {id, created, eventData, userData} = req.body;

    query(`UPDATE transactions
           SET purchased_on=to_timestamp($1),
               purchase_confirmed= TRUE
           WHERE transaction_id = $2`, [created, id])
        .then(_ => query('SELECT * FROM transactions WHERE transaction_id=$1', [id]))
        .then(rows => {
            const ticketId = rows[0].ticket_id

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
                         WHERE transaction_id = $1`, [id])
                })
                .catch(console.error)

            res.status(200).json({ticket: ticketId})
            res.end();
        })
        .catch(err => console.log(err))
})

/**
 * - Confirm order
 * - Create new transaction and save to transactions DB table
 * - If there are extra tickets purchase saved those in the extra_ticket table
 * - Create a Stripe payment intent
 * - Return the Stripe payment intent to to the front end. That is used to complete the payment there
 */
app.post("/create-payment-intent", (req, res) => {

    const {price, qty, email, firstname, lastname, tipAmount, additionalTickets} = req.body;
    const total = (qty * price) + tipAmount
    let payIntent;

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
            payIntent = paymentIntent
            const ticketCount = qty + additionalTickets.length;
            const ticketId = `ypstl_${firstname}_${lastname}_${paymentIntent.id.split('_')[1]}_${ticketCount}`

            return query(`INSERT INTO transactions(firstname, lastname, price, ticket_id, email, transaction_id, qty,
                                                   total_paid, tip)
                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                          RETURNING id`,
                [firstname, lastname, price, ticketId, email, paymentIntent.id, qty, total, tipAmount])

        })
        .then(rows => insertId = rows[0].id)
        .then(id => {
            if (!additionalTickets.length) return;

            const rows = []
            additionalTickets.map(i => rows.push([i, id]))
            const sql = format('INSERT INTO extra_tickets (full_name, buyer_id) VALUES %L', rows);

            return query(sql, [])
        })
        .then(() => {
            res.json({
                clientSecret: payIntent.client_secret
            });
        })
        .catch(console.error)
});

/**
 * Get ticket information for ticket_id
 * Used to get scanned QR data
 */
app.post('/transaction', ensureAuthenticated, (req, res) => {
    const {ticketId} = req.body;

    query('SELECT * FROM transactions WHERE ticket_id=$1', [ticketId])
        .then(rows => {
            if(!rows.length)
                return res.json({error: 'User not found'}).end();

            const ticketData = rows[0];

            if (ticketData.qty === 1) {
                res.status(200).json(ticketData);
                res.end();
                return;
            }

            return query('SELECT * FROM extra_tickets WHERE buyer_id=$1', [ticketData.id])
                .then(exRows => {
                    ticketData.additionalTickets = exRows;
                    res.status(200).json(ticketData);
                    res.end();
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).end()
        })
});

/**
 * Get all transactions from the transactions DB table
 */
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


/**
 * Check-in users - Update DB
 */
app.post('/check-in', ensureAuthenticated, (req, res) => {
    const data = req.body;
    const adminId = req.user.id;

    const queries = [];

    data.map(({mainBuyer, id}) => {
        const sql = !mainBuyer
            ? 'UPDATE extra_tickets SET checked_in=true, checked_in_on=now(), checked_in_by=$1 WHERE id=$2 RETURNING id'
            : 'UPDATE transactions SET checked_in=true, checked_in_on=now(), checked_in_by=$1 WHERE id=$2 RETURNING id'

        queries.push(query(sql, [adminId, id]))
    })

    Promise.all(queries)
        .then(rows => {
            const updatedIds = [];
            rows.map(i => updatedIds.push(i[0].id))
            res.status(200).json({updatedIds})
        })
        .catch(err => {
            console.log(err)
            res.json({error: 'Failed to update database'}).end();
        })
});

app.listen(5000, () => console.log('Running on http://localhost:5000'));