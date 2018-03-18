const router = require('express').Router();

const Message = require('../models/message');
const authorization = require('../middlewares/authorization');

router.get('/', authorization);

router.get('/', async (req, res) => {

    try {

        const { skip, limit, before } = req.query;

        const messages = await Message.loadByTimeAsc({
            skip: ~~skip,
            limit: ~~limit,
            before
        });

        res.send(messages);
    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

module.exports = router;