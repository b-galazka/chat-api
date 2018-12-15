const User = require('../models/User');

exports.signIn = async (req, res, next) => {

    try {

        const { username, password } = req.body;

        const user = await User.findByCredentials({ username, password });

        const token = await User.generateToken({
            username: user.username,
            id: user.id
        });

        // TODO: add GET users/me instead of setting username cookie
        res.cookie('username', user.username);
        res.cookie('token', token, { httpOnly: true });

        res.send({ token });

    } catch (err) {

        if (err.message === 'invalid credentials') {

            return res.status(403).send({ message: 'wrong username or password' });
        }

        next(err);
    }
};

exports.signOut = (req, res) => {

    // TODO: clear only token cookie
    res.clearCookie('username');
    res.clearCookie('token');

    res.send({ message: 'logged out' });
};