const router = require('express').Router();


const checkUsernameAvailability = require('../middlewares/checkUsernameAvailability');
const authorization = require('../middlewares/authorization');
const userSchema = require('../validationSchemas/user');
const validateRequestBody = require('../middlewares/validateRequestBody');
const controllers = require('../controllers/users');

const usernameAvailabilityRequestSchema = require(
    '../validationSchemas/usernameAvailabilityRequest'
);

router.post('/', validateRequestBody(userSchema));
router.post('/', checkUsernameAvailability);
router.get('/', authorization);
router.post('/username-availability', validateRequestBody(usernameAvailabilityRequestSchema));

router.get('/', controllers.getUsers);
router.post('/', controllers.addUser);
router.post('/username-availability', controllers.checkUsernameAvailability);

module.exports = router;