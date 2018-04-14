const { TEXT, DATE, NOW, INTEGER, Op } = require('sequelize');

const db = require('../db');
const User = require('./User');
const MessageAttachment = require('./MessageAttachment');
const trimStrings = require('../functions/trimSequelizeModelStrings');

const messageSchema = {

    id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    date: {
        type: DATE,
        defaultValue: NOW
    },

    content: {
        type: TEXT,
        allowNull: false
    },

    authorId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,

        references: {
            model: User,
            key: 'id'
        }
    }
};

const Message = db.define('message', messageSchema, { timestamps: false });

Message.belongsTo(User, {
    as: 'author',
    foreignKey: 'authorId'
});

Message.hasOne(MessageAttachment, {
    as: 'attachment',
    foreignKey: 'messageId'
});

Message.loadByTimeAsc = async ({ skip, limit, before } = {}) => {

    const options = {

        order: [
            ['id', 'DESC']
        ],

        attributes: ['id', 'content', 'date'],

        include: [
            {
                model: User,
                as: 'author',
                attributes: ['username']
            }
        ]
    };

    if (skip !== undefined) {

        options.offset = skip;
    }

    if (limit !== undefined) {

        options.limit = limit;
    }

    if (before !== undefined) {

        options.where = {

            id: {
                [Op.lt]: before
            }
        };
    }

    const messages = await Message.findAll(options);

    return messages.reverse();
};

Message.createWithAttachment = async (authorId, attachmentInfo) => {

    const createdMessage = await Message.create({ authorId, content: '' });

    await MessageAttachment.createWithMiniatures(
        createdMessage.id, 
        attachmentInfo
    );

    return Message.findSavedMessageFullData(createdMessage.id);
};

Message.findSavedMessageFullData = id => Message.findById(id, {

    attributes: ['id', 'content', 'date'],

    include: [

        {
            model: User,
            as: 'author',
            attributes: ['username']
        },

        {
            model: MessageAttachment,
            as: 'attachment',
            attributes: [
                'type',
                'name',
                'size',
                'url',
                'iconUrl',
                'resizedImageUrl'
            ]
        }
    ]
});

Message.hook('beforeValidate', trimStrings);

module.exports = Message;