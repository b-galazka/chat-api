const cuid = require('cuid');
const path = require('path');
const sharp = require('sharp');

const {
    uploadsDir,
    resizedImagesDimensions,
    imagesIconsDimensions
} = require('../config');

class ImageResizer {

    constructor(filePath) {

        this._filePath = filePath;
        this._extension = filePath.slice(filePath.lastIndexOf('.'));
    }

    createIcon() {

        return (async () => {

            const path = this._createRandomPath();
            const { width, height } = imagesIconsDimensions;

            await sharp(this._filePath)
                .resize(width, height)
                .toFile(path);

            return path;
        })();
    }

    createResizedImage() {

        return (async () => {

            const path = this._createRandomPath();
            const { width, height } = resizedImagesDimensions;

            await sharp(this._filePath)
                .resize(width, height)
                .withoutEnlargement()
                .min()
                .toFile(path);

            return path;
        })();
    }

    _createRandomPath() {

        return path.resolve(uploadsDir, cuid() + this._extension);
    }
}

module.exports = ImageResizer;