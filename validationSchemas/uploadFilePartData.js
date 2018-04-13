const Joi = require('joi');

module.exports = Joi.object().keys({

    id: Joi.string(),
    data: Joi.object().type(Buffer)

}).requiredKeys('id', 'data');