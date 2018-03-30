const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const authCredentialsSchema = require('../validationSchemas/authCredentials');
const validateRequestBody = require('../middlewares/validateRequestBody');
const { jwtSecret, jwtTtl } = require('../config');

router.post('/', validateRequestBody(authCredentialsSchema));

router.post('/', async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({ username, password });

        if (user) {

            const { username, _id } = user;

            jwt.sign({ username, _id }, jwtSecret, { expiresIn: jwtTtl }, (err, token) => {
                
                if (err) {

                    throw err;
                }

                res.send({
                    token
                });
            });
        } else {

            res.status(403).send({
                message: 'wrong username or password'
            });
        }
    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

module.exports = router;