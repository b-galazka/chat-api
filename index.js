const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

// middlewares
const catchJsonParsingError = require('./middlewares/catchJsonParsingError');
const socketAuthorization = require('./middlewares/socketAuthorization');
const setCorsHeaders = require('./middlewares/setCorsHeaders');
const catchCorsError = require('./middlewares/catchCorsError');

// routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');
const notFoundRoutes = require('./routes/notFound');

const ChatSocket = require('./sockets/Chat');

// configuration constants
const { port, ip } = require('./config');

// start express
const app = express();

// configure express
app.disable('x-powered-by');

app.use(setCorsHeaders);
app.use(catchCorsError);
app.use(bodyParser.json());
app.use(catchJsonParsingError);

// set express routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/messages', messagesRoutes);
app.use('*', notFoundRoutes);

// configure socket.io
const server = http.Server(app);
const io = socketIO(server, {
    pingInterval: 10000, 
    pingTimeout: 5000
});

io.use(socketAuthorization);

// start socket
const chatSocket = new ChatSocket(io).init();

// listen for requests
server.listen(port, ip, () => {

    if (process.env.NODE_ENV !== 'test') {

        console.log(`app is listening for requests at ${ip}:${port}`);
    }
});

// export for tests
module.exports = {
    app,
    chatSocket
};