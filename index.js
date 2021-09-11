"use strict";

const fs = require('fs')
const nodemailer = require("nodemailer");

let config = JSON.parse(fs.readFileSync("config.json"));

let transporter = nodemailer.createTransport(config.transport);

async function sendMail(from, subject, text) {
    let info = await transporter.sendMail({
        from: '"' + from + '" <' + config.mail + '>',
        to: config.mail,
        subject: subject,
        text: text
    });

    console.log("Message sent: %s", info.messageId);
}

sendMail("Pontigram", "Test", "This is a test e-mail from Pontigram.");