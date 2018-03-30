const configureDotenv = require('./functions/configureDotenv');

configureDotenv();

console.log(typeof process.env.PORT);

const {
    HASH_SECRET,
    JWT_SECRET,
    PORT,
    IP,
    JWT_TTL,
    DB_URL,
    ALLOWED_DOMAINS
} = process.env;

module.exports = {

    hashSecret: HASH_SECRET || 'secret string',
    jwtSecret: JWT_SECRET || 'another secret string',

    port: +PORT || 3000,
    ip: IP || '127.0.0.1',

    dbUrl: DB_URL || '',

    jwtTtl: JWT_TTL || '24h',

    allowedDomains: ALLOWED_DOMAINS ? ALLOWED_DOMAINS.split(',') : []
};