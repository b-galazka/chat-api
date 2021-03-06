const router = require('express').Router();

const checkUsernameAvailability = require('../middlewares/guards/checkUsernameAvailability');
const authorization = require('../middlewares/guards/authorization');
const userSchema = require('../validationSchemas/user');
const validateRequestBody = require('../middlewares/validateRequestBody');
const handleInvalidHttpMethod = require('../middlewares/handlers/handleInvalidHttpMethod');
const controllers = require('../controllers/users');

const usernameAvailabilityRequestSchema = require(
    '../validationSchemas/usernameAvailabilityRequest'
);

router.post('/', validateRequestBody(userSchema));
router.post('/', checkUsernameAvailability);
router.get('/', authorization);
router.post('/username-availability', validateRequestBody(usernameAvailabilityRequestSchema));
router.get('/me', authorization);

router.get('/', controllers.getUsers);
router.post('/', controllers.addUser);
router.post('/username-availability', controllers.checkUsernameAvailability);
router.get('/me', controllers.getCurrentUser);

router.all('/', handleInvalidHttpMethod(['GET', 'POST']));
router.all('/username-availability', handleInvalidHttpMethod('POST'));
router.all('/me', handleInvalidHttpMethod('GET'));

module.exports = router;