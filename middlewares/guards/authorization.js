const { TokenExpiredError, JsonWebTokenError } = require('jsonwebtoken');

const User = require('../../models/User');
const getTokenFromHeader = require('../../functions/getTokenFromHeader');
const logger = require('../../utils/logger');

module.exports = async (req, res, next) => {

    try {

        const authHeader = req.header('Authorization');
        const cookiesHeader = req.header('Cookie');
        const token = getTokenFromHeader(authHeader, cookiesHeader);

        const tokenData = await User.verifyToken(token);

        req.tokenData = tokenData;

        next();

    } catch (err) {

        logger.error(err);

        if (err instanceof JsonWebTokenError) {

            const tokenStatus = (err instanceof TokenExpiredError) ? 'expired' : 'invalid';

            return res.status(401).send({ message: `${tokenStatus} token` });
        }

        const { message } = err;

        return res.status(403).send({ message });
    }
};