const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config');

const validateAuthHeader = (authHeader) => {

    if (!authHeader) {

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

    jwt.verify(token.trim(), jwtSecret, (err, data) => {

        if (err) {

            console.error(err);

            return res.status(401).send({
                message: 'expired or invalid token'
            });
        }

        next();
    });
};