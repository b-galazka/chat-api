const router = require('express').Router();

const controllers = require('../controllers/notFound');

// TODO: add invalid HTTP method handler
router.all('*', controllers.notFound);

module.exports = router;