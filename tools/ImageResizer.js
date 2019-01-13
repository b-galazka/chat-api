const cuid = require('cuid');
const path = require('path');
const sharp = require('sharp');

const {
    uploadsDir,
    previewsDimensions,
    iconsDimensions
} = require('../config');

class ImageResizer {

    constructor(filePath) {

        this._filePath = filePath;
        this._extension = filePath.slice(filePath.lastIndexOf('.'));
    }

    createIcon() {

        return (async () => {

            const path = this._createRandomPath();

            const { width, height, size } = await sharp(this._filePath)
                .resize(iconsDimensions.width, iconsDimensions.height)
                .toFile(path);

            return {
                path,
                metadata: { width, height, size }
            };
        })();
    }

    createPreview() {

        return (async () => {

            const path = this._createRandomPath();

            const { width, height, size } = await sharp(this._filePath)
                .resize(previewsDimensions.width, previewsDimensions.height)
                .withoutEnlargement()
                .min()
                .toFile(path);

            return {
                path,
                metadata: { width, height, size }
            };
        })();
    }

    static isProperFileType(fileType) {

        return (fileType.startsWith('image/') && !fileType.endsWith('/gif'));
    }

    _createRandomPath() {

        return path.resolve(uploadsDir, cuid() + this._extension);
    }
}

module.exports = ImageResizer;