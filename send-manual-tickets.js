const sendEmail = require('./email');
const {query} = require("./db");

const createTransaction = ({firstname, lastname, email, paid}) => {
    query('SELECT * FROM product')
        .then(rows => {
            const product = rows[0]
            const ticketId = `ypstl_${firstname}_${lastname}_${email}_1`
            const id = `venmo_${firstname}_${lastname}_${email}`
            const tip = (paid - product.price).toFixed(2);

            query(`INSERT INTO transactions(firstname, lastname, price, ticket_id, email, transaction_id, qty,
                                            total_paid, tip, paid_w_venmo, purchase_confirmed)
                   VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8, TRUE, TRUE)
                   RETURNING id`,
                [firstname, lastname, product.price, ticketId, email, id, paid, tip])
                .then(() =>
                    sendEmail({
                        title: 'Young Professionals of Saint Louis 5K Ball',
                        ticketId,
                        firstname,
                        lastname,
                        product: 'Young Professionals of Saint Louis 5K Ball - ticket',
                        qty: 1,
                        price: product.price,
                        tipAmount: tip,
                        total: paid,
                        date_time: 'FRI 04.01.22 | 9PM - MIDNIGHT',
                        venue: 'Piper Palm House - Tower Grove Park',
                        email: email
                    }))
        })
        .catch(console.error)

}
