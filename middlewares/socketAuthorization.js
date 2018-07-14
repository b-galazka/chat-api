const { TokenExpiredError, JsonWebTokenError } = require('jsonwebtoken');

const User = require('../models/User');
const getToken = require('../functions/getToken');

module.exports = async (socket, next) => {

    try {

        const { cookie, authorization } = socket.handshake.headers;
        console.log(authorization);
        const token = getToken(authorization, cookie);

        socket.handshake.tokenData = await User.verifyToken(token);

        next();

    } catch (err) {

        console.error(err);

        if (err instanceof JsonWebTokenError) {

            const tokenStatus = (err instanceof TokenExpiredError) ? 'expired' : 'invalid';

            return next(new Error(`${tokenStatus} token provided`));
        }

        next(err);
    }
};