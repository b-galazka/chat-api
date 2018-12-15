const isProd = (process.env.NODE_ENV === 'production');

const sourceMaps = require('source-map-support');

if (isProd) {

    sourceMaps.install();
}

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const catchJsonParsingError = require('./middlewares/errorsCatchers/catchJsonParsingError');
const catchCorsError = require('./middlewares/errorsCatchers/catchCorsError');
const catchUnknownError = require('./middlewares/errorsCatchers/catchUnknownError');
const socketAuthorization = require('./middlewares/socketAuthorization');
const setCorsHeaders = require('./middlewares/setCorsHeaders');
const routes = require('./routes');

const ChatSocket = require('./sockets/Chat');
const handleSocketPreflightRequest = require('./functions/handleSocketPreflightRequest');
const logger = require('./utils/logger');

// configuration constants
const { port, ip } = require('./config');

// start express
const app = express();

app.disable('x-powered-by');

app.use(setCorsHeaders);
app.use(catchCorsError);
app.use(express.json());
app.use(catchJsonParsingError);
app.use(routes);
app.use(catchUnknownError);

// configure socket.io
// TODO: move to sockets/Connection external class
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