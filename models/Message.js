const { TEXT, DATE, NOW, INTEGER, Op } = require('sequelize');

const db = require('../db');
const User = require('./User');
const MessageAttachment = require('./MessageAttachment');
const trimStrings = require('./utils/trimSequelizeModelStrings');

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

MessageAttachment.belongsTo(Message, {
    as: 'message',
    foreignKey: 'messageId'
});

Message._includeOptions = [

    {
        association: 'author',
        attributes: ['username']
    },

    {
        association: 'attachment',
        attributes: ['type', 'name', 'size', 'urls']
    }
];

Message.loadByTimeAsc = async ({ skip, limit, before } = {}) => {

    const messages = await Message.findAll({

        order: [
            ['id', 'DESC']
        ],

        attributes: ['id', 'content', 'date'],
        include: Message._includeOptions,

        offset: (skip !== undefined) ? skip : undefined,
        limit: (limit !== undefined) ? limit : undefined,
        where: (before !== undefined) ? { id: { [Op.lt]: before } } : undefined
    });

    return messages.reverse();
};

Message.createWithAttachment = async (authorId, attachmentInfo) => {

    const createdMessage = await Message.create({ authorId, content: '' });

    await MessageAttachment.createWithPreview(
        createdMessage.id,
        attachmentInfo
    );

    return Message.findSingleMessageFullData(createdMessage.id);
};

Message.findSingleMessageFullData = id => Message.findById(id, {

    attributes: ['id', 'content', 'date'],
    include: Message._includeOptions
});

Message.hook('beforeValidate', trimStrings);

module.exports = Message;