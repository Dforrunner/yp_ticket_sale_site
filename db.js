require('dotenv').config();
const {Pool} = require('pg')

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});


const query = (sql, data, cb) =>
    new Promise((resolve, reject) => {
        db.connect((err, client, release) => {
            if (err) return reject(err.stack)

            client.query(sql, data, (err, result) => {
                release()
                if (err) return reject(err.stack)
                resolve(result.rows)
            })
        })
    })

module.exports = {query, db};