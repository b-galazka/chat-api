const { TokenExpiredError } = require('jsonwebtoken');

const User = require('../models/User');

module.exports = async (socket, next) => {

    const { token } = socket.handshake.query;

    try {

        if (token === undefined) {

            return next(new Error('no token provided'));
        }

        socket.handshake.tokenData = await User.verifyToken(token);

        next();

    } catch (err) {

        console.error(err);

        const tokenStatus = (
            (err instanceof TokenExpiredError) ? 'expired' : 'invalid'
        );

        next(new Error(`${tokenStatus} token provided`));
    }
};