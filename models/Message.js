const { TEXT, DATE, NOW, INTEGER, Op } = require('sequelize');

const db = require('../db');
const User = require('./User');
const trimStrings = require('../functions/trimSequelizeModelStrings');

const messageSchema = {

    id: {
        type: INTEGER,
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
        type: INTEGER,
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

Message.findSavedMessageFullData = id => Message.findById(id, {

    attributes: ['id', 'content', 'date'],

    include: [
        {
            model: User,
            as: 'author',
            attributes: ['username']
        }
    ]
});

Message.hook('beforeValidate', trimStrings);

module.exports = Message;