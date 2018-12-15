class ExpressResponse {

    constructor() {

        this.headers = {};
        this.headersSent = false;
    }

    status() {

        return this;
    }

    send() {

        this.headersSent = true;

        return this;
    }

    setHeader(name, value) {

        this.headers[name] = value;
    }

    getHeader(name) {

        return this.headers[name];
    }
}

module.exports = ExpressResponse;