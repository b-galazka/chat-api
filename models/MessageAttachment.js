const { STRING, INTEGER, JSON: JsonDataType, Op } = require('sequelize');

const db = require('../db');
const trimStrings = require('./utils/trimSequelizeModelStrings');
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
    },

    metadata: {
        type: JsonDataType,
        allowNull: true
    }
};

const MessageAttachment = db.define(
    'messageAttachment',
    messageAttachmentSchema,
    { timestamps: false }
);

MessageAttachment.createWithPreview = async (messageId, fileInfo) => {

    const savedFile = await SavedFile.create({ path: fileInfo.path });
    const files = { originalFile: { id: savedFile.id, metadata: fileInfo.metadata } };

    if (ImageResizer.isProperFileType(fileInfo.type)) {

        const previews = await MessageAttachment._createImagePreviews(fileInfo.path);

        Object.assign(files, previews);
    }

    return MessageAttachment.create({
        type: fileInfo.type,
        name: fileInfo.name + fileInfo.extension,
        size: fileInfo.size,
        urls: MessageAttachment._getFilesUrls(files),
        metadata: MessageAttachment._getFilesMetadata(files),
        messageId
    });
};

MessageAttachment._createImagePreviews = async (filePath) => {

    const imagesResizer = new ImageResizer(filePath);

    const [icon, preview] = await Promise.all([
        imagesResizer.createIcon(),
        imagesResizer.createPreview()
    ]);

    const [savedIcon, savedPreview] = await Promise.all([
        SavedFile.create({ path: icon.path }),
        SavedFile.create({ path: preview.path })
    ]);

    return {
        icon: { id: savedIcon.id, metadata: icon.metadata },
        preview: { id: savedPreview.id, metadata: preview.metadata }
    };
};

MessageAttachment._getFilesUrls = filesInfo => Object.keys(filesInfo).reduce((result, fileType) => {

    const fileId = filesInfo[fileType].id;

    result[fileType] = '/get-file/' + fileId;

    return result;

}, {});

MessageAttachment._getFilesMetadata = filesInfo => (
    Object.keys(filesInfo).reduce((result, fileType) => {

        const fileMetadata = filesInfo[fileType].metadata;

        if (fileMetadata && !result) {

            return { [fileType]: fileMetadata };
        }

        if (fileMetadata) {

            result[fileType] = fileMetadata;
        }

        return result;

    }, null)
);

MessageAttachment.loadByTimeDesc = ({ skip, limit, before } = {}) => {

    return MessageAttachment.findAll({

        order: [
            ['id', 'DESC']
        ],

        attributes: ['id', 'type', 'name', 'size', 'urls', 'metadata'],

        include: [

            {
                association: 'message',
                attributes: ['date'],
                include: [{ association: 'author', attributes: ['username'] }]
            }
        ],

        offset: skip,
        limit,
        where: (before !== undefined) ? { id: { [Op.lt]: before } } : undefined
    });
};

MessageAttachment.hook('beforeValidate', trimStrings);

module.exports = MessageAttachment;