const mongoose = require('mongoose');

const hash = require('../functions/hash');

const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        trim: true
    },
    
    password: {
        type: String,
        required: true
    }
});

UserSchema.statics = {

    loadAlphabeticalList() {

        return this.find(
            {},
            { username: true, _id: true },
            { sort: { username: 1 } }
        );
    }
};

UserSchema.pre('findOne', function (next) {

    const { username, password } = this.getQuery();
    
    if (username) {

        this.where({ username: new RegExp(`^${username.trim()}$`, 'i') })
    }

    if (password) {

        this.where({ password: hash(password) });
    }

    next();
});

UserSchema.pre('save', function (next) {

    this.password = hash(this.password);

    next();
});

const User = mongoose.model('user', UserSchema);

module.exports = User;