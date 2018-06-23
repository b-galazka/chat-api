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
    UPLOADS_DIR,
    MAX_UPLOADED_FILE_SIZE,
    FILE_UPLOAD_TIMEOUT,
    IMAGES_ICONS_DIMENSIONS,
    RESIZED_IMAGES_DIMENSIONS
} = process.env;

let imagesIconsDimensions;
let resizedImagesDimensions;

if (IMAGES_ICONS_DIMENSIONS) {

    const [width, height] = IMAGES_ICONS_DIMENSIONS.split(',');

    imagesIconsDimensions = {
        width: +width,
        height: +height
    };

} else {

    imagesIconsDimensions = {
        width: 200,
        height: 200
    };
}

if (RESIZED_IMAGES_DIMENSIONS) {

    const [width, height] = RESIZED_IMAGES_DIMENSIONS.split(',');

    resizedImagesDimensions = {
        width: +width,
        height: +height
    };

} else {

    resizedImagesDimensions = {
        width: 600,
        height: 600
    };
}

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

    uploadsDir: path.resolve(UPLOADS_DIR || './uploaded_files'),
    maxUploadedFileSize: +MAX_UPLOADED_FILE_SIZE || 10485760,
    fileUploadTimeout: +FILE_UPLOAD_TIMEOUT || 60000,

    imagesIconsDimensions,
    resizedImagesDimensions
};