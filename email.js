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

const sendEmail = ({
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
                   }) =>
    generateTicket(ticketId)
        .then(qrUrl => {

            let transporter = nodemailer.createTransport({
                name: process.env.EMAIL_NAME,
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT), // set to 465 when deployed
                secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            transporter.use('compile', inlineBase64())

            return transporter.sendMail({
                from: '"Young Professionals of St. Louis 👩🏿‍💼🧑🏻‍💼👩🏽‍💼🧑🏼‍💼" <info@ypstl.com>', // sender address
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
            });
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
//     .then(info => {
//         console.log("Message sent: %s", info);
//     })

