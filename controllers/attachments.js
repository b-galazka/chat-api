const MessageAttachment = require('../models/MessageAttachment');
const getPaginationOptions = require('./utils/getPaginationOptions');

exports.getAttachments = async (req, res, next) => {

    try {

        const options = getPaginationOptions(req.query);

        const attachments = await MessageAttachment.loadByTimeDesc(options);

        res.send(attachments);

    } catch (err) {

        next(err);
    }
};