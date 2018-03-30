const Joi = require('joi');

const User = require('../models/user');

module.exports = async (req, res, next) => {

    const { username } = req.body;
    
    try {

        const user = await User.findOne({ username });

        if (user) {

            return res.status(409).send({
                message: 'provided username is being used'
            });
        }

        next();

    } catch (err) {

        console.error(err);

        return res.status(500).send({
            message: 'something went wrong'
        });
    }
};