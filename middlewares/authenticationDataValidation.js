const Joi = require('joi');

const authCredentialsSchema = require('../validationSchemas/authCredentials');

module.exports = (req, res, next) => {

    const { error } = Joi.validate(req.body, authCredentialsSchema);

    if (error) {

        return res.status(400).send({ message: error.message });
    }

    next();
};