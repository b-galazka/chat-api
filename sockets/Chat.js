const Joi = require('joi');

const User = require('../models/User');
const Message = require('../models/Message');
const messageSchema = require('../validationSchemas/message');
const uploadInfoSchema = require('../validationSchemas/uploadInfo');
const uploadFilePartDataSchema = require('../validationSchemas/uploadFilePartData');
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
            this._setOnUploadFilePartHandler(socket);
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
        
                const { error } = Joi.validate(message, messageSchema);
                
                if (error) {

                    return socket.emit('message validation error', { 
                        tempID: message && message.tempID, 
                        message: error.message
                    });
                }

                const { tempID, content } = message;
                const savedMessage = await Message.create({ authorId, content });

                const savedMessageFullData = await Message.findSavedMessageFullData(
                    savedMessage.id
                );

                socket.broadcast.emit('message', savedMessageFullData);

                socket.emit('message saved', {
                    tempID,
                    message: savedMessageFullData
                });
            } catch (err) {

                console.error(err);

                socket.emit('message sending error', { tempID: message.tempID });
            }
        });
    }

    _setOnStartFileUploadHandler(socket) {

        socket.on('start file upload', (uploadInfo) => {

            const { error } = Joi.validate(uploadInfo, uploadInfoSchema);

            if (error) {

                return socket.emit('file info validation error', {
                    tempId: uploadInfo && uploadInfo.tempId,
                    message: error.message
                });
            }

            const { fileInfo, tempId } = uploadInfo;
            const fileUpload = new FileUpload(fileInfo);

            fileUpload.once('timeout', () => {

                this._activeFilesUploads.delete(fileUpload.id);

                socket.emit('file upload timeout', { tempId });
            });

            this._activeFilesUploads.set(fileUpload.id, fileUpload);

            socket.emit('file upload started', {
                tempId,
                uploadId: fileUpload.id
            });
        });
    }

    _setOnUploadFilePartHandler(socket) {

        socket.on('upload file part', async (uploadData) => {

            const { error } = Joi.validate(uploadData, uploadFilePartDataSchema);

            if (error) {

                return socket.emit('uploading file part error', {
                    uploadId: uploadData && uploadData.id,
                    message: error.message
                });
            }

            const { id: uploadId, data } = uploadData;
            const fileUpload = this._activeFilesUploads.get(id);

            if (!fileUpload) {

                return socket.emit('uploading file part error', {
                    uploadId,
                    message: 'invalid ID'
                });
            }

            await fileUpload.writeFile(data);

            if (fileUpload.isFinished()) {

                // todo: save records to DB

            } else {

                socket.emit('file part uploaded', {
                    id,
                    uploadedBytes: fileUpload.writtenBytes
                });
            }
        });
    }
}

module.exports = ChatSocket;