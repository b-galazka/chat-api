const router = require('express').Router();

const controllers = require('../controllers/home');

router.get('/', controllers.getHome);

module.exports = router;