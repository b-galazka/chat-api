const Joi = require('joi');

module.exports = Joi.object().keys({

    username: Joi.string()
        .min(4)
        .max(16)
        .regex(/[^a-z0-9_]/i, { invert: true }),

    password: Joi.string()
        .min(8)
        .max(32)
        .regex(/\d/)
        .regex(/[a-z]/)
        .regex(/[A-Z]/)
        .regex(/\W/)

}).requiredKeys('username', 'password');