const Joi = require('joi');

const User = require('../models/user');
const userSchema = require('../validationSchemas/user');

module.exports = async (req, res, next) => {

    const { error } = Joi.validate(req.body, userSchema);

    if (error) {

        return res.status(400).send({message: error.message});
    }

    const { username } = req.body;
    
    try {

        const user = await User.findOne({
            username: new RegExp(`^${username.trim()}$`, 'i')
        });

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