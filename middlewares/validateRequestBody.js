const Joi = require('joi');

module.exports = requestBodySchema => (req, res, next) => {

    const { error } = Joi.validate(req.body, requestBodySchema);

    if (error) {

        return res.status(400).send({ message: error.message });
    }

    next();
};