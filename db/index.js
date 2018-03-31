const Sequelize = require('sequelize');

const { dbName, dbHost, dbPassword, dbUser } = require('../config');

const dbOptions = {
    dialect: 'mysql',
    host: dbHost
};

module.exports = new Sequelize(dbName, dbUser, dbPassword, dbOptions);