const { TokenExpiredError, JsonWebTokenError } = require('jsonwebtoken');

const User = require('../models/User');
const getToken = require('../functions/getToken');
const logger = require('../utils/logger');

module.exports = async (socket, next) => {

    try {

        const { cookie, authorization } = socket.handshake.headers;
        logger.log(authorization);
        const token = getToken(authorization, cookie);

        socket.handshake.tokenData = await User.verifyToken(token);

        next();

    } catch (err) {

        logger.error(err);

        if (err instanceof JsonWebTokenError) {

            const tokenStatus = (err instanceof TokenExpiredError) ? 'expired' : 'invalid';

            return next(new Error(`${tokenStatus} token provided`));
        }

        next(err);
    }
};