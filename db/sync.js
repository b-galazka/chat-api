const mysql = require('mysql2/promise');

const { dbName, dbHost, dbPassword, dbUser } = require('../config');
const Message = require('../models/Message');
const User = require('../models/User');
const SavedFile = require('../models/SavedFile');
const MessageAttachment = require('../models/MessageAttachment');
const db = require('./');

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

    await User.sync();
    await Message.sync();

    await Promise.all([
        MessageAttachment.sync(),
        SavedFile.sync()
    ]);
};

(async () => {

    const { NODE_ENV } = process.env;

    try {

        await createDatabaseIfNotExists();
        await syncSequelizeModels();

        await db.close();

        console.log(`${NODE_ENV || ''} DB synced`);

    } catch(err) {

        console.error(`something went wrong during syncing ${NODE_ENV || ''} DB`);
        console.error(err);
    }
})();