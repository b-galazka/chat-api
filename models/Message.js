const { TEXT, DATE, NOW, INTEGER } = require('sequelize');

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

Message.hook('beforeValidate', trimStrings);

module.exports = Message;

/* const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({

    date: {
        type: Date,
        default: Date.now
    },

    author: {
        type: String,
        trim: true,
        required: true
    },

    content: {
        type: String,
        trim: true,
        required: true
    }
});

MessageSchema.statics = {

    async loadByTimeAsc({ skip = 0, limit = 0, before }) {

        const messages = await this.find(

            before ? 
            
            {
                _id: {
                    $lt: before
                }
            } :

            {},

            { __v: false },

            {
                sort: {
                    _id: -1
                },

                skip,
                limit
            }
        );

        return messages.reverse();
    }
};

const Message = mongoose.model('messages', MessageSchema);

module.exports = Message; */