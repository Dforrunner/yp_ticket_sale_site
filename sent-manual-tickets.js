const sendEmail = require('./email');
const {query} = require("./db");

const createTransaction = (firstname, lastname, email, paid, tip=0) => {
    query('SELECT * FROM product')
        .then(rows => {
            const product = rows[0]
            const ticketId = `ypstl_${firstname}_${lastname}_${email}_1`
            const id = `venmo_${firstname}_${lastname}_${email}`

            query(`INSERT INTO transactions(firstname, lastname, price, ticket_id, email, transaction_id, qty,
                                            total_paid, tip)
                   VALUES ($1, $2, $3, $4, $5, $6, 1, $8, $9)
                   RETURNING id`,
                [firstname, lastname, product.price, ticketId, email, id, paid, tip])
        })
        .catch(console.error)

}