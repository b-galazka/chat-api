const cookie = require('cookie');

const getTokenFromAuthHeader = (authHeader) => {

    const regex = /^Bearer ([a-z0-9_-]+)\.([a-z0-9_-]+)\.([a-z0-9_-]+)$/i;

    if (regex.test(authHeader)) {

        return authHeader.split(' ')[1];
    }

    throw new Error('invalid authorization header provided');
};

const getTokenFromCookiesHeader = (cookiesHeader) => {

    if (!cookiesHeader) {

        throw new Error('no cookies nor authorization header provided');
    }

    const regex = /token=([a-z0-9_-]+)\.([a-z0-9_-]+)\.([a-z0-9_-]+)/i;

    if (regex.test(cookiesHeader)) {

        return cookie.parse(cookiesHeader).token;
    }

    throw new Error('invalid cookies header provided');
};

module.exports = (authHeader, cookiesHeader) => (
    (authHeader === undefined) ?
        getTokenFromCookiesHeader(cookiesHeader) :
        getTokenFromAuthHeader(authHeader)
);