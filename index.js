if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const translate = require('translate-google')
const { createServer } = require('node:http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);

function initSocket(server) {
    const io = new Server(server, { cors: { origin: '*' } });
    io.on('connection', (socket) => {
        socket.on('event', (event) => {
            console.log(event);
            socket.broadcast.emit('event', event);
        });
        socket.on('error', (error) => {
            console.error('Socket.IO error:', error);
            socket.emit('error', { message: 'An error occurred' });
        });
    })
}

initSocket(server);

app.use(cors());
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN } = process.env;
const PORT = process.env.PORT || 3000;

app.post("/webhook", async (req, res) => {
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));
    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    if (message?.type === "text") {
        const business_phone_number_id =
            req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                to: message.from,
                text: { body: "Hema: " + message.text.body },
                context: {
                    message_id: message.id, // shows the message as a reply to the original user message
                },
            },
        });

        // mark incoming message as read
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                status: "read",
                message_id: message.id,
            },
        });
    }

    res.sendStatus(200);
});


app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
        console.log("Webhook verified successfully!");
    } else {
        res.sendStatus(403);
    }
});

const pool = mysql.createPool({
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6699654',
    password: 'v3DrjW4cXu',
    database: 'sql6699654',
    waitForConnections: true
})

// pool.query('SELECT * FROM customers_categories', function (error, results, fields) {
//     if (error) {
//         console.error('Error fetching databases: ' + error.stack);
//         return;
//     }
//     console.log(results);
// });

app.get('/translate', async (req, res) => {
    const { text } = req.query;
    try {
        const TRANSLATED = await translate(text, { to: 'ta' });
        res.json({ TRANSLATED });
    } catch (error) {
        res.status(500).json({ error });
    }
})

server.listen(PORT, () => console.log('Server Started at ' + PORT));

app.use('/', (req, res) => res.send('Calendar'));

