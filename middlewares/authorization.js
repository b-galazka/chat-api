const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config');

const validateAuthHeader = (authHeader) => {

    if (! authHeader) {

        return 'no authorization header provided';
    }

    if (! authHeader.includes(' ')) {

        return 'invalid authorization header provided';
    }
};

module.exports = async (req, res, next) => {

    const authHeader = req.header('Authorization');

    const err = validateAuthHeader(authHeader);

    if (err) {

        return res.status(403).send({
            message: err
        });
    }

    const [authMethod, token] = authHeader.split(' ');

    if (authMethod.trim().toLowerCase() !== 'bearer') {

        return res.status(403).send({
            message: 'only bearer authorization is supported'
        });
    }

    jwt.verify(token.trim(), jwtSecret, (err, data) => {

        if (err) {

            console.error(err);

            return res.status(401).send({
                message: 'invalid token'
            });
        }

        next();
    });
};