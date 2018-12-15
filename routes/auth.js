const router = require('express').Router();

const authCredentialsSchema = require('../validationSchemas/authCredentials');
const validateRequestBody = require('../middlewares/validateRequestBody');
const handleInvalidHttpMethod = require('../middlewares/handlers/handleInvalidHttpMethod');
const controllers = require('../controllers/auth');

router.post('/sign-in', validateRequestBody(authCredentialsSchema));

router.post('/sign-in', controllers.signIn);
router.get('/sign-out', controllers.signOut);

router.all('/sign-in', handleInvalidHttpMethod('POST'));
router.all('/sign-out', handleInvalidHttpMethod('GET'));

module.exports = router;