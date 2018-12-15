const Joi = require('joi');

module.exports = urlQueryObjectSchema => (req, res, next) => {

    const { error } = Joi.validate(req.query, urlQueryObjectSchema);

    if (error) {

        const { message } = error;

        return res.status(400).send({ message });
    }

    next();
};

// TODO: create validateRequest(schema, body/query)