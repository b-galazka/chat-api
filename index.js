const isProd = (process.env.NODE_ENV === 'production');

const sourceMaps = require('source-map-support');

if (isProd) {

    sourceMaps.install();
}

const express = require('express');
const http = require('http');

const catchJsonParsingError = require('./middlewares/errorsCatchers/catchJsonParsingError');
const catchCorsError = require('./middlewares/errorsCatchers/catchCorsError');
const catchUnknownError = require('./middlewares/errorsCatchers/catchUnknownError');
const setCorsHeaders = require('./middlewares/guards/setCorsHeaders');
const routes = require('./routes');

const logger = require('./utils/logger');
const { port, ip } = require('./config');
const SocketsIO = require('./sockets/SocketsIO');

const app = express();

app.disable('x-powered-by');

app.use(setCorsHeaders);
app.use(catchCorsError);
app.use(express.json());
app.use(catchJsonParsingError);
app.use(routes);
app.use(catchUnknownError);

const server = http.Server(app);

new SocketsIO(server).init();

server.listen(port, ip, () => logger.log(`app is listening for requests at ${ip}:${port}`));