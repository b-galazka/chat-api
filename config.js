const path = require('path');

const configureDotenv = require('./functions/configureDotenv');

configureDotenv();

const {
    HASH_SECRET,
    JWT_SECRET,
    PORT,
    IP,
    JWT_TTL,
    ALLOWED_DOMAINS,
    DB_NAME,
    DB_USER,
    DB_PASS,
    DB_HOST,
    DOMAIN,
    UPLOADS_DIR,
    MAX_UPLOADED_FILE_SIZE,
    FILE_UPLOAD_TIMEOUT
} = process.env;

module.exports = {

    hashSecret: HASH_SECRET || 'secret string',
    jwtSecret: JWT_SECRET || 'another secret string',

    port: +PORT || 3000,
    ip: IP || '127.0.0.1',

    dbName: DB_NAME || 'chat',
    dbUser: DB_USER || 'root',
    dbPassword: DB_PASS || '',
    dbHost: DB_HOST || '127.0.0.1',

    jwtTtl: JWT_TTL || '24h',

    allowedDomains: ALLOWED_DOMAINS ? ALLOWED_DOMAINS.split(',') : [],

    uploadsDir: path.resolve(__dirname, UPLOADS_DIR || './uploaded_files'),
    maxUploadedFileSize: +MAX_UPLOADED_FILE_SIZE || 10485760,
    fileUploadTimeout: +FILE_UPLOAD_TIMEOUT || 60000
};