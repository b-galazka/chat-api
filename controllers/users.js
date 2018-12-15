const User = require('../models/User');
const logger = require('../utils/logger');

exports.getUsers = async (req, res) => {

    try {

        const users = await User.loadAlphabeticalList();

        res.send(users);
    } catch (err) {

        logger.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
};

exports.addUser = async (req, res) => {

    try {

        const { username, password } = req.body;

        const createdUser = await User.create({ username, password });

        res.status(201).send({
            username: createdUser.username,
            id: createdUser.id
        });
    } catch (err) {

        logger.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
};

exports.checkUsernameAvailability = async (req, res) => {

    try {

        const { username } = req.body;

        const user = await User.findOne({

            where: {
                username: username.trim()
            }
        });

        res.send({
            username,
            free: !user
        });
    } catch (err) {

        logger.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
};