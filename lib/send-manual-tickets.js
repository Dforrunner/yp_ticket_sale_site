const sendEmail = require('./email');
const { query } = require('./db');
const format = require('pg-format');

const createTransaction = ({ firstname, lastname, email, paid, extras = [] }) => {
  query('SELECT * FROM product')
    .then((rows) => {
      const product = rows[0];
      const ticketId = `ypstl_${firstname}_${lastname}_${email}_1`;
      const id = `venmo_${firstname}_${lastname}_${email}`;
      const tip = (paid - product.price).toFixed(2);
      const qty = 1 + extras.length;
      let insertId;

      query(
        `INSERT INTO transactions(firstname, lastname, price, ticket_id, email, transaction_id, qty,
                                  total_paid, tip, purchase_confirmed)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, TRUE)
          RETURNING id`,
        [firstname, lastname, product.price, ticketId, email, id, qty, paid, tip]
      )
        .then((rows) => (insertId = rows[0].id))
        .then((id) => {
          if (!extras.length || !id) return;

          const rows = [];
          extras.forEach((i) => rows.push([i.full_name, id]));
          console.log(rows);
          const sql = format('INSERT INTO extra_tickets (full_name, buyer_id) VALUES %L', rows);

          return query(sql, []);
        })
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
            email: email,
          })
        );
    })
    .catch(console.error);
};
/**
 {[{firstname: string, paid: number, email: string, lastname: string}]}
 */
const transactions = [];

transactions.forEach((t) => {
  createTransaction(t);
});
