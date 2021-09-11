"use strict";

const fs = require('fs')
const nodemailer = require("nodemailer");
const { WAConnection } = require("@adiwajshing/baileys")

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

async function connectToWhatsApp() {
    const conn = new WAConnection()

    conn.on("open", () => {
        config.whatsapp = conn.base64EncodedAuthInfo();
        fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
    })

    if (config.whatsapp) {
        conn.loadAuthInfo (config.whatsapp);
    }

    await conn.connect()
}

sendMail("Pontigram", "Test", "This is a test e-mail from Pontigram.");

connectToWhatsApp();