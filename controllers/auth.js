const ms = require('ms');

const User = require('../models/User');
const { jwtTtl } = require('../config');

exports.signIn = async (req, res, next) => {

    try {

        const { username, password, keepSignedIn } = req.body;

        const user = await User.findByCredentials({ username, password });

        const token = await User.generateToken({
            username: user.username,
            id: user.id
        });

        res.cookie('token', token, {
            httpOnly: true,
            expires: keepSignedIn ? new Date(Date.now() + ms(jwtTtl)) : 0
        });

        res.send({ token, user });

    } catch (err) {

        if (err.message === 'invalid credentials') {

            return res.status(403).send({ message: 'wrong username or password' });
        }

        next(err);
    }
};

exports.signOut = (req, res) => {

    res.clearCookie('token');
    res.send({ message: 'signed out' });
};