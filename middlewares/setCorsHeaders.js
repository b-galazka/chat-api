const { allowedDomains } = require('../config');

module.exports = (req, res, next) => {

    const domain = req.headers.origin;

    if (allowedDomains.includes(domain)) {

        res.set('Access-Control-Allow-Origin', domain);
    }

    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
};