const router = require('express').Router();

const authorization = require('../middlewares/guards/authorization');
const handleInvalidHttpMethod = require('../middlewares/handlers/handleInvalidHttpMethod');
const controllers = require('../controllers/files');

router.get('/:id', authorization);

router.get('/:id', controllers.getFileById);

router.all('/:id', handleInvalidHttpMethod('GET'));

module.exports = router;