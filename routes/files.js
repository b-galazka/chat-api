const router = require('express').Router();

const authorization = require('../middlewares/authorization');
const controllers = require('../controllers/files');

router.get('/:id', authorization);

router.get('/:id', controllers.getFileById);

module.exports = router;