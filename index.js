const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.NODE_STRIPE_SK);
const uuid = require('uuid').v4();

const app = express();

app.use(express.json());
app.use(cors);


app.get('/', (req, res) => {
    res.send('Hello World')
})

app.post('/payment', (req, res) => {
    const {product, token} = req.body;

    console.log('Product', product);
    console.log('Price', product.price);

    const idempontencyKey = uuid();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    })
        .then(customer => {
            stripe.charges.create({
                amount: product.price * 100,
                currency: 'usd',
                customer: customer.id,
                receipt_email: token.email,
                description: product.name
            }, {idempotencyKey})
        })
        .then(result => res.status(200).json(result))
        .catch(error => console.error(error));
})

app.listen(5050, () => console.log('Listening http://localhost:5050/'))
