const router = require('express').Router();

const controllers = require('../controllers/home');
const handleInvalidHttpMethod = require('../middlewares/handlers/handleInvalidHttpMethod');

router.get('/', controllers.getHome);

router.all('/', handleInvalidHttpMethod('GET'));

module.exports = router;