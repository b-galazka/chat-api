const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config');

module.exports = (socket, next) => {

    const { token } = socket.handshake.query;

    jwt.verify(token, jwtSecret, (err, data) => {

        if (err) {
            
            return next(new Error('invalid token or no token provided'));
        }

        socket.handshake.tokenData = data;

        next();
    });
};