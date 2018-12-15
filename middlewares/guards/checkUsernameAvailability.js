const User = require('../../models/User');

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

        next(err);
    }
};