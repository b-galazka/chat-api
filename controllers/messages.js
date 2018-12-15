const Message = require('../models/Message');
const getPaginationOptions = require('../functions/getPaginationOptions');
const logger = require('../utils/logger');

exports.getMessages = async (req, res) => {

    try {

        const options = getPaginationOptions(req.query);

        const messages = await Message.loadByTimeAsc(options);

        res.send(messages);
    } catch (err) {

        logger.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
};