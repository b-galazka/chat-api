const { TokenExpiredError, JsonWebTokenError } = require('jsonwebtoken');

const User = require('../../models/User');
const getToken = require('../../functions/getToken');
const logger = require('../../utils/logger');

module.exports = async (req, res, next) => {

    try {

        const authHeader = req.header('Authorization');
        const cookiesHeader = req.header('Cookie');
        const token = getToken(authHeader, cookiesHeader);

        await User.verifyToken(token);

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