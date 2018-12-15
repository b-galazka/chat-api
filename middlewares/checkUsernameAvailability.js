const User = require('../models/User');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {

    const { username } = req.body;

    try {

        // TODO: move to User.checkUsernameAvailability?
        const user = await User.findOne({
            where: { username }
        });

        if (user) {

            return res.status(409).send({
                message: 'provided username is being used'
            });
        }

        next();

    } catch (err) {

        logger.error(err);

        return res.status(500).send({
            message: 'something went wrong'
        });
    }
};