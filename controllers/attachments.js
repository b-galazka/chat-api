const MessageAttachment = require('../models/MessageAttachment');
const getPaginationOptions = require('../functions/getPaginationOptions');

exports.getAttachments = async (req, res, next) => {

    try {

        const options = getPaginationOptions(req.query);

        const attachments = await MessageAttachment.loadByTimeDesc(options);

        res.send(attachments);

    } catch (err) {

        next(err);
    }
};