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

    console.log("E-mail sent: %s", info.messageId);
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
            
            let from = "";
            let to = "Me";
            let subject = "";
            let text = "";
            if (envelope.key.fromMe) {
                from = "Me";
                to = conn.contacts[envelope.key.remoteJid].name;
                subject = to;
            } else {
                if (envelope.key.participant) {
                    from = conn.contacts[envelope.key.participant].name;
                    subject = conn.contacts[envelope.key.remoteJid].name;
                } else {
                    from = conn.contacts[envelope.key.remoteJid].name;
                    subject = from;
                }
            }
            console.log("from: " + from);
            console.log("to: " + to);
            console.log("subject: " + subject);

            const content = envelope.message;
            if (content.conversation) {
                text = content.conversation;
            }
            if (content.extendedTextMessage) {
                text = content.extendedTextMessage.text;
            }
            if (content.contactMessage) {
                text = content.contactMessage.displayName + ": " + content.contactMessage.vcard;
            }
            if (content.imageMessage) {
                text = content.imageMessage.url + "\n\n" + content.imageMessage.caption;
            }
            if (content.audioMessage) {
                text = content.audioMessage.url;
            }
            if (content.documentMessage) {
                text = content.documentMessage.url;
            }
            console.log("text: " + text);

            if (to === "Me") {
                sendMail(from, subject, text);
            }
        }
        console.log("---");
    })

    if (config.whatsapp) {
        conn.loadAuthInfo(config.whatsapp);
    }

    await conn.connect();
}

connectToWhatsApp();