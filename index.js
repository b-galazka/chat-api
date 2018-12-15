const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

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
const filesRoutes = require('./routes/files');
const attachmentsRoutes = require('./routes/attachments');

const ChatSocket = require('./sockets/Chat');
const handleSocketPreflightRequest = require('./functions/handleSocketPreflightRequest');
const logger = require('./utils/logger');

// configuration constants
const { port, ip } = require('./config');

// start express
const app = express();

// configure express
app.disable('x-powered-by');

app.use(setCorsHeaders);
app.use(catchCorsError);
app.use(express.json());
app.use(catchJsonParsingError);

// set express routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/messages', messagesRoutes);
app.use('/attachments', attachmentsRoutes);
app.use(filesRoutes);
app.use('*', notFoundRoutes);

// configure socket.io
const server = http.Server(app);
const io = socketIO(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    handlePreflightRequest: handleSocketPreflightRequest
});

io.use(socketAuthorization);

// start socket
new ChatSocket(io).init();

// listen for requests
server.listen(port, ip, () => {

    logger.log(`app is listening for requests at ${ip}:${port}`);
});