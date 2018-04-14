const { STRING, INTEGER } = require('sequelize');

const db = require('../db');
const trimStrings = require('../functions/trimSequelizeModelStrings');
const Message = require('./Message');
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
    
    url: {
        type: STRING(50),
        allowNull: false
    },

    iconUrl: {
        type: STRING(50)
    },

    resizedImageUrl: {
        type: STRING(50)
    },

    messageId: {
        type: INTEGER.UNSIGNED,

        references: {
            model: Message,
            key: 'id'
        }
    }
};

const MessageAttachment = db.define(
    'messageAttachment', 
    messageAttachmentSchema,
    { timestamps: false }
);

MessageAttachment.createWithMiniatures = async (messageId, fileInfo) => {

    const savedFile = await SavedFile.create({ path: fileInfo.path });

    let miniaturesIds = {};

    if (ImageResizer.isProperFileType(fileInfo.type)) {

        miniaturesIds = await MessageAttachment._createMiniatures(fileInfo.path);
    }

    const { iconId, resizedImageId } = miniaturesIds;

    return MessageAttachment.create({
        type: fileInfo.type,
        name: fileInfo.name + fileInfo.extension,
        size: fileInfo.size,
        url: '/get-file/' + savedFile.id,
        iconUrl: iconId && '/get-file/' + iconId,
        resizedImageUrl: resizedImageId && '/get-file/' + resizedImageId,
        messageId
    });
};

MessageAttachment._createMiniatures = async (filePath) => {

    const imagesResizer = new ImageResizer(filePath);

    const [iconPath, resizedImagePath] = await Promise.all([
        imagesResizer.createIcon(),
        imagesResizer.createResizedImage()
    ]);

    const [icon, resizedImage] = await Promise.all([
        SavedFile.create({ path: iconPath }),
        SavedFile.create({ path: resizedImagePath })
    ]);

    return {
        iconId: icon.id,
        resizedImageId: resizedImage.id
    };
};

MessageAttachment.hook('beforeValidate', trimStrings);

module.exports = MessageAttachment;