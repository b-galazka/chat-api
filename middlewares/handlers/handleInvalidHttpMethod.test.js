const handleInvalidHttpMethod = require('./handleInvalidHttpMethod');
const ExpressRequest = require('../../mocks/nodeModules/ExpressRequest');
const ExpressResponse = require('../../mocks/nodeModules/ExpressResponse');

describe('handleInvalidHttpMethod middleware', () => {

    let req;
    let res;
    let spy;

    beforeEach(() => {

        req = new ExpressRequest();
        res = new ExpressResponse();
    });

    it('should return a function', () => {

        const returnedValue = handleInvalidHttpMethod([]);

        expect(returnedValue).toBeInstanceOf(Function);
    });

    it('should respond with status 405', () => {

        spy = jest.spyOn(res, 'status');

        handleInvalidHttpMethod([])(req, res);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(405);
    });

    it('should respond with one available method', () => {

        spy = jest.spyOn(res, 'send');

        handleInvalidHttpMethod('GET')(req, res);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ message: 'method not allowed', allowedMethods: 'GET' });
    });

    it('should respond with all available methods', () => {

        spy = jest.spyOn(res, 'send');

        handleInvalidHttpMethod(['GET', 'PUT', 'POST'])(req, res);

        expect(spy).toHaveBeenCalledTimes(1);

        expect(spy).toHaveBeenCalledWith({
            message: 'method not allowed',
            allowedMethods: 'GET, PUT, POST'
        });
    });

    afterEach(() => {

        if (spy) {

            spy.mockReset();
            spy.mockRestore();
        }
    });
});