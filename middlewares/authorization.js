const { TokenExpiredError } = require('jsonwebtoken');
const cookie = require('cookie');

const User = require('../models/User');

const validateAuthHeader = (authHeader) => {

    const regex = /^Bearer ([a-z0-9_-]+)\.([a-z0-9_-]+)\.([a-z0-9_-]+)$/i;

    if (!regex.test(authHeader)) {

        return 'invalid authorization header provided';
    }
}

const validateCookiesHeader = (cookiesHeader) => {

    if (!cookiesHeader) {
        
        return 'no cookies nor authorization header provided';
    }

    const regex = /token=([a-z0-9_-]+)\.([a-z0-9_-]+)\.([a-z0-9_-]+)/i;

    if (!regex.test(cookiesHeader)) {

        return 'invalid cookies header provided';
    }
};

module.exports = async (req, res, next) => {

    const authHeader = req.header('Authorization');
    const cookiesHeader = req.header('Cookie');

    const headerValidationError = (
        (authHeader === undefined) ?
            validateCookiesHeader(cookiesHeader) :
            validateAuthHeader(authHeader)    
    );

    if (headerValidationError) {

        return res.status(403).send({
            message: headerValidationError
        });
    }

    const token = (
        (authHeader === undefined) ?
            cookie.parse(cookiesHeader).token :
            authHeader.split(' ')[1]
    );

    try {

        await User.verifyToken(token);

        next();

    } catch (err) {

        console.error(err);

        const tokenStatus = (err instanceof TokenExpiredError) ? 'expired' : 'invalid';

        return res.status(401).send({
            message: `${tokenStatus} token`
        });
    }
};