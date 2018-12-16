const User = require('../../models/User');

module.exports = async (req, res, next) => {

    const { username } = req.body;

    try {

        const isUsernameAvailable = await User.isUsernameAvailable(username.trim());

        if (!isUsernameAvailable) {

            return res.status(409).send({
                message: 'provided username is being used'
            });
        }

        next();

    } catch (err) {

        next(err);
    }
};