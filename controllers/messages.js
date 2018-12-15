const Message = require('../models/Message');
const getPaginationOptions = require('../functions/getPaginationOptions');

exports.getMessages = async (req, res, next) => {

    try {

        const options = getPaginationOptions(req.query);

        const messages = await Message.loadByTimeAsc(options);

        res.send(messages);

    } catch (err) {

        next(err);
    }
};