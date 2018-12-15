const router = require('express').Router();

const authCredentialsSchema = require('../validationSchemas/authCredentials');
const validateRequestBody = require('../middlewares/validateRequestBody');
const controllers = require('../controllers/auth');

router.post('/sign-in', validateRequestBody(authCredentialsSchema));

router.post('/sign-in', controllers.signIn);
router.get('/sign-out', controllers.signOut);

module.exports = router;