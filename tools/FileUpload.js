const cuid = require('cuid');

class FileUpload {

    constructor(fileInfo) {

        this._fileInfo = fileInfo;

        this.id = cuid();
    }
}

module.exports = FileUpload;