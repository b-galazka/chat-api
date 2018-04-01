const { STRING, INTEGER } = require('sequelize');
const crypto = require('crypto');

const { hashSecret } = require('../config');
const db = require('../db');
const trimStrings = require('../functions/trimSequelizeModelStrings');

const userSchema = {

    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    username: {
        type: STRING(30),
        allowNull: false
    },

    password: {
        type: STRING(255),
        allowNull: false
    }
};

const User = db.define('user', userSchema, { timestamps: false });

User.generateHash = password => (
    crypto
        .createHmac('sha512', hashSecret)
        .update(password)
        .digest('hex')
);

User.isTokenExpired = tokenData => tokenData.exp * 1000 < Date.now();

User.hook('beforeValidate', trimStrings);

module.exports = User;




/* const mongoose = require('mongoose');

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

module.exports = User; */