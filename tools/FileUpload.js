const cuid = require('cuid');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

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

        return new Promise((resolve) => {

            const writeStream = this._writeStream;

            this._updateTimeout();

            writeStream.write(data, () => {

                this.writtenBytes = writeStream.bytesWritten;

                resolve();

                if (this.isFinished()) {

                    clearTimeout(this._timeout);

                    writeStream.close();
                }
            });
        });
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

        this._timeout = setTimeout(async () => {

            this.emit('timeout');

            try {

                await this._removePartlyUploadedFile();

            } catch (err) {

                logger.error(err);
            }

        }, fileUploadTimeout);
    }

    _updateTimeout() {

        clearTimeout(this._timeout);

        this._initTimeoutEvent();
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