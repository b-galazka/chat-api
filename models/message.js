const mongoose = require('mongoose');

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

const Message = mongoose.model('messages', MessageSchema);

module.exports = Message;