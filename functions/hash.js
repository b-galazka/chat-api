const crypto = require('crypto');

const { hashSecret } = require('../config');

module.exports = str => crypto.createHmac('sha256', hashSecret).update(str).digest('hex');