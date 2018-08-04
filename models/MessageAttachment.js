const { STRING, INTEGER, JSON: JsonDataType, Op } = require('sequelize');

const db = require('../db');
const trimStrings = require('../functions/trimSequelizeModelStrings');
const SavedFile = require('./SavedFile');
const ImageResizer = require('../tools/ImageResizer');

const messageAttachmentSchema = {

    id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    type: {
        type: STRING(30),
        allowNull: false
    },

    name: {
        type: STRING(255),
        allowNull: false
    },

    size: {
        type: INTEGER.UNSIGNED,
        allowNull: false
    },

    urls: {
        type: JsonDataType,
        allowNull: false
    }
};

const MessageAttachment = db.define(
    'messageAttachment',
    messageAttachmentSchema,
    { timestamps: false }
);

MessageAttachment.createWithPreview = async (messageId, fileInfo) => {

    const savedFile = await SavedFile.create({ path: fileInfo.path });
    const filesIds = { originalFile: savedFile.id };

    let previewsIds = {};

    if (ImageResizer.isProperFileType(fileInfo.type)) {

        previewsIds = await MessageAttachment._createImagePreviews(fileInfo.path);
    }

    // TODO: generate video preview

    Object.assign(filesIds, previewsIds);

    return MessageAttachment.create({
        type: fileInfo.type,
        name: fileInfo.name + fileInfo.extension,
        size: fileInfo.size,
        urls: MessageAttachment._getFilesUrls(filesIds),
        messageId
    });
};

MessageAttachment._createImagePreviews = async (filePath) => {

    const imagesResizer = new ImageResizer(filePath);

    const [iconPath, previewPath] = await Promise.all([
        imagesResizer.createIcon(),
        imagesResizer.createPreview()
    ]);

    const [icon, preview] = await Promise.all([
        SavedFile.create({ path: iconPath }),
        SavedFile.create({ path: previewPath })
    ]);

    return {
        icon: icon.id,
        preview: preview.id
    };
};

MessageAttachment._getFilesUrls = (filesIds) => Object.keys(filesIds).reduce((urls, fileType) => {

    const fileId = filesIds[fileType];

    urls[fileType] = '/get-file/' + fileId;

    return urls;

}, {});

MessageAttachment.loadByTimeAsc = ({ skip, limit, before } = {}) => {

    const options = {

        order: [
            ['id', 'DESC']
        ],

        attributes: ['id', 'type', 'name', 'size', 'url', 'iconUrl', 'resizedImageUrl'],

        include: [

            {
                association: 'message',
                attributes: ['date'],
                include: [
                    { association: 'author', attributes: ['username'] }
                ]
            }
        ]
    };

    if (skip !== undefined) {

        options.offset = skip;
    }

    if (limit !== undefined) {

        options.limit = limit;
    }

    if (before !== undefined) {

        options.where = {

            id: {
                [Op.lt]: before
            }
        };
    }

    return MessageAttachment.findAll(options);
};

MessageAttachment.hook('beforeValidate', trimStrings);

module.exports = MessageAttachment;