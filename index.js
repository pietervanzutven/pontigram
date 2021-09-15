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

    conn.on("chat-update", async chat => {
        console.log("chat-update:");
        console.log(chat);

        if (chat.hasNewMessage) {
            const envelope = chat.messages.all()[0];
            console.log("envelope:");
            console.log(envelope);
            
            let subject = "Private";
            let from = "";
            let to = "Me";
            if (envelope.key.fromMe) {
                from = "Me";
                to = conn.contacts[envelope.key.remoteJid].name;
            } else {
                if (envelope.key.participant) {
                    subject = conn.contacts[envelope.key.remoteJid].name;
                    from = conn.contacts[envelope.key.participant].name;
                } else {
                    from = conn.contacts[envelope.key.remoteJid].name;
                }
            }
            console.log("subject: " + subject);
            console.log("from: " + from);
            console.log("to: " + to);

            const content = envelope.message;
            if (content.conversation) {
                console.log("conversation: " + content.conversation);
            }
            if (content.extendedTextMessage) {
                console.log("extended text: " + content.extendedTextMessage.text);
            }
            if (content.contactMessage) {
                console.log("contact: " + content.contactMessage);
            }
            if (content.imageMessage) {
                console.log("image: " + content.imageMessage.url);
            }
            if (content.audioMessage) {
                console.log("audio: " + content.audioMessage.url);
            }
            if (content.documentMessage) {
                console.log("document: " + content.documentMessage.url);
            }
        }
        console.log("---");
    })

    if (config.whatsapp) {
        conn.loadAuthInfo(config.whatsapp);
    }

    await conn.connect();
}

sendMail("Pontigram", "Test", "This is a test e-mail from Pontigram.");

connectToWhatsApp();