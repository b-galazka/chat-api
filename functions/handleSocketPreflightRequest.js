const { allowedDomains } = require('../config');

module.exports = (req, res) => {

    const { origin } = req.headers;

    if (!origin) {

        res.writeHead(200);

    } else if (allowedDomains.includes(origin)) {

        res.writeHead(200, {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': true
        });

    } else {

        res.writeHead(403);
    }

    res.end();
};

// TODO: move to controllers