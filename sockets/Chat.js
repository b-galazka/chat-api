const Joi = require('joi');

const User = require('../models/User');
const Message = require('../models/Message');
const messageSchema = require('../validationSchemas/message');
const fileInfoSchema = require('../validationSchemas/fileInfo');
const FileUpload = require('../tools/FileUpload');

class ChatSocket {

    constructor(io) {

        this._io = io;
        this._connectedUsers = [];
        this._activeFilesUploads = new Map();
    }

    init() {

        this._io.on('connection', (socket) => {

            const { username } = socket.handshake.tokenData;

            this._addConnectedUserToList(username);
            this._sendUsersList();

            this._setTokenExpirationMiddleware(socket);
            this._setOnDisconnectHandler(socket);
            this._setOnMessageHandler(socket);
            this._setOnStartFileUploadHandler(socket);
        });

        return this;
    }

    _sendUsersList() {

        (async () => {

            try {

                this._disconnectSocketsWithExpiredTokens();

                const connectedUsers = this._connectedUsers.slice();

                const users = await User.loadAlphabeticalList();

                const usersList = users.map(user => ({
                    id: user.id,
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

            if (User.isTokenExpired(tokenData)) {

                this._disconnectSocket(socket);
            }
        });
    }

    _setTokenExpirationMiddleware(socket) {

        socket.use((packet, next) => {

            const { tokenData } = socket.handshake;

            if (User.isTokenExpired(tokenData)) {

                return this._disconnectSocket(socket);
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

        const { username, id: authorId } = socket.handshake.tokenData;

        socket.on('message', async (message) => {

            try {

                this._disconnectSocketsWithExpiredTokens();

                const { tempID, content } = message;
                const { error } = Joi.validate(message, messageSchema);

                if (error) {

                    return socket.emit('message validation error', error.message);
                }

                const savedMessage = await Message.create({ authorId, content });

                const savedMessageFullData = await Message.findSavedMessageFullData(
                    savedMessage.id
                );

                socket.broadcast.emit('message', savedMessageFullData);

                socket.emit('message saved', {
                    tempID: message.tempID,
                    message: savedMessageFullData
                });
            } catch (err) {

                console.error(err);

                socket.emit('sending error', message.tempID);
            }
        });
    }

    _setOnStartFileUploadHandler(socket) {

        socket.on('start file upload', (fileInfo) => {

            const { error } = Joi.validate(fileInfo, fileInfoSchema);

            if (error) {

                return socket.emit('file info validation error', error.message);
            }

            const fileUpload = new FileUpload(fileInfo);

            this._activeFilesUploads.set(fileUpload.id, fileUpload);

            socket.emit('file upload started', fileUpload.id);
        });
    }
}

module.exports = ChatSocket;