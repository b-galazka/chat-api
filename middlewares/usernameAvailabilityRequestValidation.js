const Joi = require('joi');

const requestSchema = require('../validationSchemas/usernameAvailabilityRequest');

module.exports = async (req, res, next) => {

    const { error } = Joi.validate(req.body, requestSchema);

    if (error) {

        return res.status(400).send({ message: error.message });
    }

    next();
};