const MessageAttachment = require('../models/MessageAttachment');
const getPaginationOptions = require('../functions/getPaginationOptions');
const logger = require('../utils/logger');

exports.getAttachments = async (req, res) => {

    try {

        const options = getPaginationOptions(req.query);

        const attachments = await MessageAttachment.loadByTimeDesc(options);

        res.send(attachments);
    } catch (err) {

        logger.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
};