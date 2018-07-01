const { TokenExpiredError } = require('jsonwebtoken');
const cookie = require('cookie');

const User = require('../models/User');

module.exports = async (socket, next) => {

    const { headers, query } = socket.handshake;
    const cookies = cookie.parse(String(headers.cookie));
    const token = query.token || cookies.token;

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