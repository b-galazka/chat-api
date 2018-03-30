const dotenv = require('dotenv');

module.exports = () => {

    const { NODE_ENV } = process.env;

    if (NODE_ENV === 'production') {

        dotenv.config({ path: 'prod.env' });

    } else if (NODE_ENV === 'development') {

        dotenv.config({ path: 'dev.env' });

    } else if (NODE_ENV === 'test') {

        dotenv.config({ path: 'test.env' });
    }

    dotenv.config({ path: '.env' });
};