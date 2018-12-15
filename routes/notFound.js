const router = require('express').Router();

const controllers = require('../controllers/notFound');

router.all('*', controllers.respondWithNotFoundMessage);

module.exports = router;