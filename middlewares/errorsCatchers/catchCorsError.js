const logger = require('../../utils/logger');

module.exports = (err, req, res, next) => {

    const { message } = err;

    logger.error(err);

    res.status(403).send({ message });
};