const { TokenExpiredError, JsonWebTokenError } = require('jsonwebtoken');

const User = require('../../models/User');
const getTokenFromHeader = require('../../functions/getTokenFromHeader');
const logger = require('../../utils/logger');

module.exports = async (socket, next) => {

    try {

        const { cookie, authorization } = socket.handshake.headers;
        const token = getTokenFromHeader(authorization, cookie);

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