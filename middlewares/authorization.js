const { TokenExpiredError } = require('jsonwebtoken');

const User = require('../models/User');

const validateAuthHeader = (authHeader) => {

    if (authHeader === undefined) {

        return 'no authorization header provided';
    }

    const regex = /^Bearer ([a-z0-9_-]+)\.([a-z0-9_-]+)\.([a-z0-9_-]+)$/i;

    if (!regex.test(authHeader)) {

        return 'invalid authorization header provided';
    }
}

module.exports = async (req, res, next) => {

    const authHeader = req.header('Authorization');
    const validationError = validateAuthHeader(authHeader);

    if (validationError) {

        return res.status(403).send({
            message: validationError
        });
    }

    const token = authHeader.split(' ')[1];

    try {

        await User.verifyToken(token);

        next();

    } catch (err) {

        console.error(err);

        const tokenStatus = (
            (err instanceof TokenExpiredError) ? 'expired' : 'invalid'
        );

        return res.status(401).send({
            message: `${tokenStatus} token`
        });
    }
};