"use strict";

const fs = require('fs')
const nodemailer = require("nodemailer");
const { WAConnection } = require("@adiwajshing/baileys")

let config = JSON.parse(fs.readFileSync("config.json"));

let transporter = nodemailer.createTransport(config.transport);

if (!fs.existsSync("./media")) {
    fs.mkdirSync("./media");
    console.log("media directory created");
} else {
    console.log("media directory exists");
}

async function sendMail(from, subject, text, attachments) {
    let info = await transporter.sendMail({
        from: '"' + from + '" <' + config.mail + '>',
        to: config.mail,
        subject: subject,
        text: text,
        attachments: attachments
    });

    console.log("E-mail sent: %s", info.messageId);
    console.log("---");
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
            let attachments = [];
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
            if (content.imageMessage || content.audioMessage || content.documentMessage) {
                text = content.imageMessage.caption || "";
                const file = await conn.downloadAndSaveMediaMessage(envelope, "./media/" + envelope.key.id);
                attachments.push({ path: file });
            }
            
            console.log("from: " + from);
            console.log("to: " + to);
            console.log("subject: " + subject);
            console.log("text: " + text);
            console.log("attachments: " + attachments);

            if (to === "Me") {
                sendMail(from, subject, text, attachments);
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