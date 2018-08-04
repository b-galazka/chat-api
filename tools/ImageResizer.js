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
            const { width, height } = iconsDimensions;

            await sharp(this._filePath)
                .resize(width, height)
                .toFile(path);

            return path;
        })();
    }

    createPreview() {

        return (async () => {

            const path = this._createRandomPath();
            const { width, height } = previewsDimensions;

            await sharp(this._filePath)
                .resize(width, height)
                .withoutEnlargement()
                .min()
                .toFile(path);

            return path;
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