const catchCorsError = require('./catchCorsError');
const ExpressRequest = require('../../mocks/nodeModules/ExpressRequest');
const ExpressResponse = require('../../mocks/nodeModules/ExpressResponse');
const logger = require('../../utils/logger');

jest.mock('../../utils/logger', () => require('../../mocks/utils/logger'));

describe('catchCorsError middleware', () => {

    let req;
    let res;
    let err;
    let spy;

    beforeEach(() => {

        req = new ExpressRequest();
        res = new ExpressResponse();
        err = new Error('error message');
    });

    it('should log an error', () => {

        spy = jest.spyOn(logger, 'error');

        catchCorsError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(err);
    });

    it('should respond with status 403', () => {

        spy = jest.spyOn(res, 'status');

        catchCorsError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(403);
    });

    it('should respond with error message', () => {

        spy = jest.spyOn(res, 'send');

        catchCorsError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ message: err.message });
    });

    afterEach(() => {

        if (spy) {

            spy.mockReset();
            spy.mockRestore();
        }
    });
});