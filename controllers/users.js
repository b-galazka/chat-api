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

        res.status(201).send({ username: createdUser.username, id: createdUser.id });

    } catch (err) {

        next(err);
    }
};

exports.checkUsernameAvailability = async (req, res, next) => {

    try {

        const { username } = req.body;

        // TODO: User.checkUsernameAvailability?
        const user = await User.findOne({
            where: { username: username.trim() }
        });

        res.send({ username, free: !user });

    } catch (err) {

        next(err);
    }
};