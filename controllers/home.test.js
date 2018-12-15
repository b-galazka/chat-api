const { getHome } = require('./home');
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

    it('should respond with a plain object', () => {

        expect.assertions(2);

        spy = jest.spyOn(res, 'send');

        getHome(req, res);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({});
    });

    afterEach(() => {

        if (spy) {

            spy.mockReset();
            spy.mockRestore();
        }
    });
});