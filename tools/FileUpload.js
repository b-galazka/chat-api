const cuid = require('cuid');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const { fileUploadTimeout, uploadsDir } = require('../config');
const logger = require('../utils/logger');

class FileUpload extends EventEmitter {

    constructor(fileInfo) {

        super();

        this.id = cuid();
        this.writtenBytes = 0;
        this.fileInfo = this._getFileInfo(fileInfo);

        this._writeStream = fs.createWriteStream(this.fileInfo.path);

        this._initTimeoutEvent();
    }

    isFinished() {

        return (this.writtenBytes >= this.fileInfo.size);
    }

    writeFile(data) {

        return new Promise((resolve, reject) => {

            this._updateTimeout();

            this._writeStream.write(data, async (err) => {

                if (err) {

                    this._cleanupAfterUploadFailure();

                    return reject(err);
                }

                this.writtenBytes = this._writeStream.bytesWritten;

                if (!this.isFinished()) {

                    return resolve();
                }

                this._cleanupAfterUploadSuccess();

                try {

                    resolve(await this.getUploadedFileMetadata());

                } catch (err) {

                    logger.error(err);

                    reject(err);
                }
            });
        });
    }

    getUploadedFileMetadata() {

        return (async () => {

            if (!this.isFinished()) {

                throw new Error('File is not fully uploaded yet');
            }

            if (!this.fileInfo.type.startsWith('image/')) {

                return null;
            }

            const { size, width, height } = await sharp(this.fileInfo.path).metadata();

            return { size, width, height };
        })();
    }

    _getFileInfo({ name, type, size }) {

        const lastDotPosition = name.lastIndexOf('.');
        const extension = name.slice(lastDotPosition);

        return {
            path: path.resolve(uploadsDir, this.id + extension),
            name: name.slice(0, lastDotPosition),
            extension,
            type,
            size
        };
    }

    _initTimeoutEvent() {

        this._timeout = setTimeout(() => {

            this.emit('timeout');
            this._cleanupAfterUploadFailure();

        }, fileUploadTimeout);
    }

    _updateTimeout() {

        clearTimeout(this._timeout);

        this._initTimeoutEvent();
    }

    _cleanupAfterUploadFailure() {

        clearTimeout(this._timeout);

        this._writeStream.close();

        return (async () => {

            try {

                await this._removePartlyUploadedFile();

            } catch (err) {

                logger.error(err);
            }
        })();
    }

    _cleanupAfterUploadSuccess() {

        clearTimeout(this._timeout);

        this._writeStream.close();
    }

    _removePartlyUploadedFile() {

        return new Promise((resolve, reject) => {

            fs.access(this.fileInfo.path, (err) => {

                if (err) {

                    return reject(err);
                }

                fs.unlink(this.fileInfo.path, err => err ? reject(err) : resolve());
            });
        });
    }
}

module.exports = FileUpload;