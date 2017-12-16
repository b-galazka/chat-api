const Joi = require('joi');

module.exports = Joi.object().keys({

    username: Joi.string(),
    password: Joi.string()
}).requiredKeys('username', 'password');