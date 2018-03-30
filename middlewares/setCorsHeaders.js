const cors = require('cors');

const { allowedDomains } = require('../config');

const corsOptions = {

    origin(domain, callback) {

        if (!domain || allowedDomains.includes(domain)) {

            callback(null, true);

        } else {

            callback(new Error('Not allowed by CORS'));
        }
    }
};

module.exports = cors(corsOptions);