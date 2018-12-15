const { respondWithNotFoundMessage } = require('./notFound');
const ExpressRequest = require('../mocks/nodeModules/ExpressRequest');
const ExpressResponse = require('../mocks/nodeModules/ExpressResponse');

describe('notFound.respondWithNotFoundMessage controller', () => {

    let req;
    let res;
    let spy;

    beforeEach(() => {

        req = new ExpressRequest();
        res = new ExpressResponse();
    });

    it('should respond with status 404 ', () => {

        expect.assertions(1);

        spy = jest.spyOn(res, 'status');

        respondWithNotFoundMessage(req, res);

        expect(spy).toHaveBeenCalledWith(404);
    });

    it('should respond with "not found" JSON message ', () => {

        expect.assertions(2);

        spy = jest.spyOn(res, 'send');

        respondWithNotFoundMessage(req, res);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ message: 'not found' });
    });

    afterEach(() => {

        if (spy) {

            spy.mockReset();
            spy.mockRestore();
        }
    });
});