const router = require('express').Router();

const Message = require('../models/Message');
const authorization = require('../middlewares/authorization');
const validateUrlQueryString = require('../middlewares/validateUrlQueryString');
const messagesQueryObjectSchema = require('../validationSchemas/messagesUrlQueryString');

router.get('/', authorization);
router.get('/', validateUrlQueryString(messagesQueryObjectSchema));

router.get('/', async (req, res) => {

    try {

        const options = Object.keys(req.query).reduce((options, key) => {

            const value = req.query[key];

            options[key] = +value;

            return options;

        }, {});

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