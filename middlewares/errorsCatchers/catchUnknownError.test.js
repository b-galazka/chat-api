const catchUnknownError = require('./catchUnknownError');
const ExpressRequest = require('../../mocks/nodeModules/ExpressRequest');
const ExpressResponse = require('../../mocks/nodeModules/ExpressResponse');
const logger = require('../../utils/logger');

jest.mock('../../utils/logger', () => require('../../mocks/utils/logger'));

describe('catchUnknownError middleware', () => {

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

        catchUnknownError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(err);
    });

    it('should respond with status 500', () => {

        spy = jest.spyOn(res, 'status');

        catchUnknownError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(500);
    });

    it('should respond with message "something went wrong"', () => {

        spy = jest.spyOn(res, 'send');

        catchUnknownError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ message: 'something went wrong' });
    });

    it('should not set status if response has been sent', () => {

        spy = jest.spyOn(res, 'status');
        res.headersSent = true;

        catchUnknownError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should not try to send second response', () => {

        spy = jest.spyOn(res, 'send');
        res.headerSent = true;

        catchUnknownError(err, req, res, jest.fn());

        expect(spy).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {

        if (spy) {

            spy.mockReset();
            spy.mockRestore();
        }
    });
});