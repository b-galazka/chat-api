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

module.exports = Message;