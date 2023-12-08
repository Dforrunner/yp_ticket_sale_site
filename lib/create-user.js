const bcrypt = require('bcryptjs');
const {query} = require("./db");



const createUser = (username,firstname ,lastname, password) =>
    bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hashedPass =>
            query('INSERT INTO users(username, pass, firstname, lastname) VALUES ($1, $2, $3, $4)',
                [username, hashedPass, firstname, lastname])
        )
        .then(rows => console.log(rows))
        .catch(err => console.log(err))


// const password = 'Ht@Admin22';
// const username = 'hannah';
// const firstname = 'Hannah';
// const lastname = 'Thornton';

// const password = '5k-Checkin';
// const username = 'bouncer';
// const firstname = 'Bouncer';
// const lastname = 'B';

const password = 'Halo@Party.';
const username = 'bouncer';
const firstname = 'Bouncer';
const lastname = 'B';
createUser(username,firstname ,lastname, password);

//
// const calTotal = (qty, price, tip) =>
//     ((qty * price) + Number(tip ? tip : 0)).toFixed(2);
//
// console.log(calTotal(2, 29.99, 5));