const router = require('express').Router();

const Message = require('../models/message');
const authorization = require('../middlewares/authorization');

router.get('/', authorization);

router.get('/', async (req, res) => {

    try {

        const { before, skip, limit } = req.query;

        const criteria = (before ? { _id: {$lt: before} } : {});

        const excludedFields = {
            __v: false
        };

        const options = {

            sort: {
                _id: -1
            },

            skip: ~~skip,
            limit: ~~limit
        };

        const messages = await Message.find(criteria, excludedFields, options);

        res.send(messages.reverse());
    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

module.exports = router;