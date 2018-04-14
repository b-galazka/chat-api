const { STRING, INTEGER } = require('sequelize');

const db = require('../db');
const trimStrings = require('../functions/trimSequelizeModelStrings');

const savedFileSchema = {

    id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    path: {
        type: STRING(255),
        allowNull: false
    }
};

const SavedFile = db.define('savedFile', savedFileSchema, {
    timestamps: false
});

SavedFile.hook('beforeValidate', trimStrings);

module.exports = SavedFile;