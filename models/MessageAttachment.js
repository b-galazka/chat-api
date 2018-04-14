const { STRING, INTEGER } = require('sequelize');

const db = require('../db');
const trimStrings = require('../functions/trimSequelizeModelStrings');

const Message = require('./Message')

const messageAttachmentSchema = {

    id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    type: {
        type: STRING(30),
        allowNull: false
    },

    name: {
        type: STRING(255),
        allowNull: false
    },

    size: {
        type: INTEGER.UNSIGNED,
        allowNull: false
    },
    
    url: {
        type: STRING(50),
        allowNull: false
    },

    iconUrl: {
        type: STRING(50)
    },

    resizedImageUrl: {
        type: STRING(50)
    },

    messageId: {
        type: INTEGER.UNSIGNED,

        references: {
            model: Message,
            key: 'id'
        }
    }
};

const MessageAttachment = db.define(
    'messageAttachment', 
    messageAttachmentSchema,
    { timestamps: false }
);

MessageAttachment.hook('beforeValidate', trimStrings);

module.exports = MessageAttachment;