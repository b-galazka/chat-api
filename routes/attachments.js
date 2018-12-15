const router = require('express').Router();

const authorization = require('../middlewares/authorization');
const validateUrlQueryString = require('../middlewares/validateUrlQueryString');
const paginationQueryStringSchema = require('../validationSchemas/paginationQueryString');

const controllers = require('../controllers/attachments');

router.get('/', authorization);
router.get('/', validateUrlQueryString(paginationQueryStringSchema));

router.get('/', controllers.getAttachments);

module.exports = router;