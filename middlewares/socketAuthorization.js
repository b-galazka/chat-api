const User = require('../models/User');

module.exports = async (socket, next) => {

    const { token } = socket.handshake.query;

    try {

        await User.verifyToken(token);

        next();

    } catch (err) {

        console.error(err);

        next(new Error('invalid token or no token provided'));
    }
};