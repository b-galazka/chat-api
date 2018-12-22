const User = require('../models/User');

exports.getUsers = async (req, res, next) => {

    try {

        const users = await User.loadAlphabeticalList();

        res.send(users);

    } catch (err) {

        next(err);
    }
};

exports.addUser = async (req, res, next) => {

    try {

        const { username, password } = req.body;

        const createdUser = await User.create({ username, password });

        const createdUserJson = createdUser.toJSON();

        delete createdUserJson.password;

        res.status(201).send(createdUserJson);

    } catch (err) {

        next(err);
    }
};

exports.checkUsernameAvailability = async (req, res, next) => {

    try {

        const { username } = req.body;

        const isUsernameAvailable = await User.isUsernameAvailable(username.trim());

        res.send({ username, free: isUsernameAvailable });

    } catch (err) {

        next(err);
    }
};

exports.getCurrentUser = async (req, res, next) => {

    try {

        const { tokenData } = req;

        const currentUser = await User.findById(tokenData.id, {
            attributes: { exclude: ['password'] }
        });

        res.send({ user: currentUser });

    } catch (err) {

        next(err);
    }
};