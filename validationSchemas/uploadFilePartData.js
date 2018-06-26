const Joi = require('joi');

const { maxFilePartSize } = require('../config');

module.exports = Joi.object().keys({

    id: Joi.string(),
    data: Joi.binary()
        .label('file part size')
        .max(maxFilePartSize)

}).requiredKeys('id', 'data');