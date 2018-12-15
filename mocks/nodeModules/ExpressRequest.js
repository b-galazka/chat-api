class ExpressRequest {

    constructor({
        headers = {},
        body = {},
        params = {}
    } = {}) {

        this.headers = headers;
        this.body = body;
        this.params = params;
    }

    header(headerName) {

        return this.headers[headerName];
    }
}

module.exports = ExpressRequest;