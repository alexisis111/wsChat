const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const messages = [];
const users = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



io.on('connection', (socket) => {
    console.log('a user connected');
    const userId = uuidv4();
    users[socket.id] = userId;
    socket.emit('chat history', messages);
    socket.on('disconnect', () => {
        console.log(`user disconnected (id: ${users[socket.id]})`);
        delete users[socket.id];
    });

    socket.on('chat message', (msg) => {
        console.log(`message from ${users[socket.id]}: ${msg}`);
        const logMessage = { id: users[socket.id], text: msg };
        messages.push(logMessage);
        io.emit('chat message', logMessage);

        fs.appendFile('log.txt', JSON.stringify(logMessage) + '\n', (err) => {
            if (err) throw err;
            console.log('message written to log file');
        });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});