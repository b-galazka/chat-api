const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const authenticationDataValidation = require('../middlewares/authenticationDataValidation');
const hash = require('../functions/hash');
const { jwtSecret, jwtTTL } = require('../config');

router.post('/', authenticationDataValidation);

router.post('/', async (req, res) => {

    try {

        const {username, password} = req.body;

        const user = await User.findOne({
            username: new RegExp(`^${username}$`, 'i'),
            password: hash(password)
        });

        if (user) {

            const { username, _id } = user;

            jwt.sign({ username, _id }, jwtSecret, { expiresIn: jwtTTL }, (err, token) => {
                
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