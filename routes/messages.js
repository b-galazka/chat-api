const router = require('express').Router();

const Message = require('../models/Message');
const authorization = require('../middlewares/authorization');
const validateUrlQueryString = require('../middlewares/validateUrlQueryString');
const paginationQueryStringSchema = require('../validationSchemas/paginationQueryString');
const getPaginationOptions = require('../functions/getPaginationOptions');

router.get('/', authorization);
router.get('/', validateUrlQueryString(paginationQueryStringSchema));

router.get('/', async (req, res) => {

    try {

        const options = getPaginationOptions(req.query);

        const messages = await Message.loadByTimeAsc(options);

        res.send(messages);
    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

module.exports = router;