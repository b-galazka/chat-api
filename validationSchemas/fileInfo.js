const Joi = require('joi');

const { maxUploadedFileSize } = require('../config');

module.exports = Joi.object().keys({

    name: Joi.string().max(255),

    size: Joi.number()
        .label('max file size')
        .min(1)
        .max(maxUploadedFileSize),

    type: Joi.string().max(255)
        
}).requiredKeys('name', 'size', 'type');