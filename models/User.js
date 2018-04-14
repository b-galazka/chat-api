const { STRING, INTEGER } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { hashSecret, jwtSecret, jwtTtl } = require('../config');
const db = require('../db');
const trimStrings = require('../functions/trimSequelizeModelStrings');

const userSchema = {

    id: {
        type: INTEGER.UNSIGNED,
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

User.verifyToken = token => new Promise((resolve, reject) => {

    jwt.verify(token, jwtSecret, (err, data) => {

        if (err) {

            return reject(err)
        }

        resolve(data);
    });
});

User.generateToken = async (credentials) => {

    const user = await User.findOne({ where: credentials });

    if (!user) {

        throw new Error('invalid credentials');
    }

    const { username, id } = user;

    return User._getToken({ username, id });
};

User._getToken = data => new Promise((resolve, reject) => {

    jwt.sign(data, jwtSecret, { expiresIn: jwtTtl }, (err, token) => {

        if (err) {

            return reject(err);
        }

        resolve(token);
    });
});

User.loadAlphabeticalList = () => User.findAll({

    attributes: ['username', 'id'],

    order: [
        ['username', 'ASC']
    ]
});

User.hook('beforeValidate', trimStrings);

User.hook('beforeCreate', (instance) => {

    if (typeof instance.password === 'string') {

        instance.password = User.generateHash(instance.password);
    }
});

User.hook('beforeFind', (options) => {

    const { where } = options;

    if (where && typeof where.password === 'string') {

        where.password = User.generateHash(where.password);
    }
});

module.exports = User;