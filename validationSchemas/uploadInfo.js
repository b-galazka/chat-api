const Joi = require('joi');

const { maxUploadedFileSize } = require('../config');

module.exports = Joi.object().keys({

    tempId: [Joi.string(), Joi.number()],

    fileInfo: Joi.object().keys({

        name: Joi.string().max(255),

        size: Joi.number()
            .label('file size')
            .min(1)
            .max(maxUploadedFileSize),

        type: Joi.string()
            .max(255)
            .allow('')

    }).requiredKeys('name', 'size', 'type')

}).requiredKeys('fileInfo');