const socketIO = require('socket.io');

const handlePreflightRequest = require('./middlewares/handlePreflightRequest');
const socketAuthorization = require('./middlewares/socketAuthorization');
const Chat = require('./Chat');

class SocketsIO {

    constructor(server) {

        this._server = server;
        this._io = null;
    }

    init() {

        if (this._io) {

            throw new Error('Sockets IO has been already opened');
        }

        this._io = socketIO(this._server, {
            pingInterval: 10000,
            pingTimeout: 5000,
            handlePreflightRequest
        });

        this._io.use(socketAuthorization);

        new Chat(this._io).init();
    }
}

module.exports = SocketsIO;