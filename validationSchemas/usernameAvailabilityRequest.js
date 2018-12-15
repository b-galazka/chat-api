const Joi = require('joi');

module.exports = Joi.object()
    .keys({
        username: Joi.string()
    })
    .requiredKeys('username');