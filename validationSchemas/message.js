const Joi = require('joi');

module.exports = Joi.object().keys({

    content: Joi.string().trim().min(1),
    tempId: [Joi.string(), Joi.number()]
}).requiredKeys('content');