const Joi = require('joi');

const positiveNumber = Joi.string().regex(/^[0-9]+$/, 'positive number');

module.exports = Joi.object().keys({

    limit: positiveNumber,
    skip: positiveNumber,
    before: positiveNumber
});