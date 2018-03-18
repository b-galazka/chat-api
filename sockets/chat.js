const Joi = require('joi');

const User = require('../models/user');
const Message = require('../models/message');
const messageSchema = require('../validationSchemas/message');
const isTokenExpired = require('../functions/isTokenExpired');

class ChatSocket {

    constructor(io) {

        this._io = io;
        this._connectedUsers = [];
    }

    init() {

        this._io.on('connection', (socket) => {

            const { username } = socket.handshake.tokenData;

            this._addConnectedUserToList(username);
            this._sendUsersList();

            this._setTokenExpirationMiddleware(socket);
            this._setOnDisconnectHandler(socket);
            this._setOnMessageHandler(socket);        
        });

        return this;
    }

    _sendUsersList() {

        (async () => {

            try {

                const connectedUsers = this._connectedUsers.slice();

                const users = await User.loadAlphabeticalList();

                const usersList = users.map(user => ({
                    _id: user._id,
                    username: user.username,
                    connected: connectedUsers.includes(user.username)
                }));

                this._io.emit('users', usersList);
            } catch (err) {

                console.error(err);

                this._io.emit('users error');
            }    
        })();
    }

    _addConnectedUserToList(username) {

        this._connectedUsers.push(username);
    }

    _removeDisconnectedUserFromList(username) {

        this._connectedUsers = this._connectedUsers.filter(user => user !== username);
    }

    _disconnectSocket(socket) {

        const { username } = socket.handshake.tokenData;

        this._removeDisconnectedUserFromList(username);

        socket.emit('expired token');

        socket.disconnect(true);
    }

    _disconnectSocketsWithExpiredTokens() {

        const { sockets } = this._io.sockets;

        Object.values(sockets).forEach((socket) => {

            const { tokenData } = socket.handshake;

            if (isTokenExpired(tokenData)) {

                this._disconnectSocket(socket);
            }
        });

        this._sendUsersList();
    }

    _setTokenExpirationMiddleware(socket) {

        socket.use((packet, next) => {

            const { tokenData } = socket.handshake;

            if (isTokenExpired(tokenData)) {

                this._disconnectSocket(socket);

                return this._sendUsersList();
            }

            next();
        });
    }

    _setOnDisconnectHandler(socket) {

        const { username } = socket.handshake.tokenData;

        socket.on('disconnect', () => {

            this._removeDisconnectedUserFromList(username);
            this._sendUsersList();
        });
    }

    _setOnMessageHandler(socket) {

        const { username } = socket.handshake.tokenData;

        socket.on('message', async (message) => {

            try {

                this._disconnectSocketsWithExpiredTokens();

                const { tempID, content } = message;
                const { error } = Joi.validate(message, messageSchema);

                if (error) {

                    return socket.emit('message validation error', error.message);
                }

                const savedMessage = await Message.create({ author: username, content });

                socket.broadcast.emit('message', savedMessage);

                socket.emit('message saved', {
                    tempID: message.tempID,
                    message: savedMessage
                });
            } catch (err) {

                console.error(err);

                socket.emit('sending error', message.tempID);
            }
        });
    }
}

module.exports = ChatSocket;