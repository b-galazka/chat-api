const mysql = require('mysql2/promise');

const { dbName, dbHost, dbPassword, dbUser } = require('../config');

(async () => {

    try {

        const connection = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPassword
        });

        await connection.query(`DROP DATABASE ${dbName}`);

        await connection.destroy();

        console.log('DB dropped');

    } catch (err) {

        console.error('something went wrong during dropping DB');
        console.error(err);
    }
})();