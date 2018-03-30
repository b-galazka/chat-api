const Joi = require('joi');

module.exports = (requestSchema) => {

    return (req, res, next) => {

        const { error } = Joi.validate(req.body, requestSchema);

        if (error) {

            return res.status(400).send({ message: error.message });
        }

        next();
    };
};