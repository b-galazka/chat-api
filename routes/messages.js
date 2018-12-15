const router = require('express').Router();

const authorization = require('../middlewares/guards/authorization');
const validateUrlQueryString = require('../middlewares/validateUrlQueryString');
const handleInvalidHttpMethod = require('../middlewares/handlers/handleInvalidHttpMethod');
const paginationQueryStringSchema = require('../validationSchemas/paginationQueryString');
const controllers = require('../controllers/messages');

router.get('/', authorization);
router.get('/', validateUrlQueryString(paginationQueryStringSchema));

router.get('/', controllers.getMessages);

router.all('/', handleInvalidHttpMethod('GET'));

module.exports = router;