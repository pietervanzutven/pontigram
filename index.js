"use strict";

const fs = require('fs')
const nodemailer = require("nodemailer");

let config = JSON.parse(fs.readFileSync("config.json"));

let transporter = nodemailer.createTransport(config.transport);

async function sendMail() {
    let info = await transporter.sendMail({
        from: '"Pontigram" <' + config.mail + '>',
        to: config.mail,
        subject: "Test",
        text: "This is a test e-mail from Pontigram."
    });

    console.log("Message sent: %s", info.messageId);
}

sendMail();