const router = require('express').Router();

const User = require('../models/User');
const authCredentialsSchema = require('../validationSchemas/authCredentials');
const validateRequestBody = require('../middlewares/validateRequestBody');

router.post('/', validateRequestBody(authCredentialsSchema));

router.post('/', async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findByCredentials({ username, password });

        const token = await User.generateToken({
            username: user.username,
            id: user.id
        });

        res.cookie('username', user.username);
        res.cookie('token', token, { httpOnly: true });

        res.send({ token });

    } catch (err) {

        console.error(err);

        if (err.message === 'invalid credentials') {

            return res.status(403).send({
                message: 'wrong username or password'
            });
        }

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

router.get('/logout', (req, res) => {

    res.clearCookie('username');
    res.clearCookie('token');

    res.send({ message: 'logged out' });
});

module.exports = router;