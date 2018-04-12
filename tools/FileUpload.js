const cuid = require('cuid');
const EventEmitter = require('events');
const fs = require('fs');

const { fileUploadTimeout } = require('../config');

class FileUpload extends EventEmitter {

    constructor(fileInfo) {

        super();

        this._fileInfo = fileInfo;

        this.id = cuid();

        this._initTimeoutEvent();
    }

    _initTimeoutEvent() {

        this._timeout = setTimeout(() => {

            // todo: remove partly uploaded file
            
            this.emit('timeout');

        }, fileUploadTimeout);
    }

    _updateTimeout() {

        clearTimeout(this._timeout);

        this._initTimeoutEvent();
    }
}

module.exports = FileUpload;