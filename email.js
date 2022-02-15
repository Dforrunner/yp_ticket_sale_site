"use strict";
const nodemailer = require("nodemailer");
require('dotenv').config();
const qr = require("qrcode");
const emailTemplate = require('./ticket-email-template');
const inlineBase64 = require('nodemailer-plugin-inline-base64');

const generateTicket = (ticketId) =>
    new Promise((resolve, reject) => {
        qr.toDataURL(ticketId,
            {
                errorCorrectionLevel: 'H',
                version: 10,
            },
            (err, src) => {
                if (err) return reject(err);
                // Let us return the QR code image as our response and set it to be the source used in the webpage
                resolve(src);
            });
    })

const send = (transponderNum, qrUrl, {
    title,
    ticketId,
    firstname,
    lastname,
    product,
    qty,
    price,
    tipAmount,
    total,
    date_time,
    venue,
    email
}) => {
    console.log('User email transponder number: ', transponderNum)
    const use1 = transponderNum === 1;

    let config = {
        auth: {
            user: use1 ? process.env.EMAIL_USER : process.env.EMAIL_USER2,
            pass: use1 ? process.env.EMAIL_PASS : process.env.EMAIL_PASS2,
        },
    };

    if (use1)
        config.service = 'gmail';
    else
        config = {
            name: use1 ? process.env.EMAIL_NAME : process.env.EMAIL_NAME2,
            host: use1 ? process.env.EMAIL_HOST : process.env.EMAIL_HOST2,
            port: Number(process.env.EMAIL_PORT), // set to 465 when deployed
            secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports,
            ...config
        }


    const transporter = nodemailer.createTransport( config);

    transporter.use('compile', inlineBase64())

    return transporter.sendMail({
        from: config.auth.user, // sender address
        to: `${email}, info@ypstl.com`,
        subject: `✨5K Ball✨ Ticket 💃🕺 - ${firstname} ${lastname}`, // Subject line
        html: emailTemplate({
            ticketId,
            title,
            firstname,
            lastname,
            product,
            qty,
            price,
            tipAmount,
            total,
            date_time,
            venue,
            email,
            tipped: tipAmount > 0,
            qrUrl
        })
    })
        .then(console.log);
};

const sendEmail = (email) =>
    generateTicket(email.ticketId)
        .then(qrUrl => {
            send(1, qrUrl, email)
                .catch(error => {
                    console.error(error);
                    send(2, qrUrl, email)
                })
        })
        .catch(console.error)

module.exports = sendEmail;


// sendEmail({
//     title: 'Young Professionals of Saint Louis 5K Ball',
//     ticketId: 'testIDsdfdsf4334',
//     firstname: 'Muhammet',
//     lastname: 'Barut',
//     product: 'Young Professionals of Saint Louis 5K Ball - ticket',
//     qty: 1,
//     price: 40,
//     tipAmount: 10,
//     total: 40,
//     date_time: 'FRI 04.01.22 | 9PM - MIDNIGHT',
//     venue: 'Piper Palm House - Tower Grove Park',
//     email: 'vtme-996@hotmail.com'
// })

