const mysql = require('mysql2/promise');

const { dbName, dbHost, dbPassword, dbUser } = require('../config');
const Message = require('../models/Message');
const User = require('../models/User');
const SavedFile = require('../models/SavedFile');
const MessageAttachment = require('../models/MessageAttachment');
const db = require('./');
const logger = require('../utils/logger');

const createDatabaseIfNotExists = async () => {

    const connection = await mysql.createConnection({
        host: dbHost,
        user: dbUser,
        password: dbPassword
    });

    await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${dbName}
            CHARACTER SET utf8
            COLLATE utf8_general_ci`
    );

    await connection.destroy();
};

const syncSequelizeModels = async () => {

    await User.sync({ alter: true });
    await Message.sync({ alter: true });

    await Promise.all([
        MessageAttachment.sync({ alter: true }),
        SavedFile.sync({ alter: true })
    ]);
};

(async () => {

    const { NODE_ENV } = process.env;

    try {

        await createDatabaseIfNotExists();
        await syncSequelizeModels();

        await db.close();

        logger.log(`${NODE_ENV || ''} DB synced`);

    } catch(err) {

        logger.error(`something went wrong during syncing ${NODE_ENV || ''} DB`);
        logger.error(err);
    }
})();