const router = require('express').Router();

const authorization = require('../middlewares/authorization');
const SavedFile = require('../models/SavedFile');
const logger = require('../utils/logger');

router.get('/get-file/:id', authorization);

router.get('/get-file/:id', async (req, res) => {

    const onErrorHandler = (err) => {

        if (err) {

            logger.error(err);

            res.status(500).send({ message: 'something went wrong' });
        }
    };

    try {

        const { id } = req.params;
        const { action, name } = req.query;

        const file = await SavedFile.findById(~~id);

        if (!file) {

            return res.status(404).send({ message: 'not found' });
        }

        if (action === 'download') {

            return res.download(file.path, name, onErrorHandler);
        }

        res.sendFile(file.path, onErrorHandler);

    } catch (err) {

        onErrorHandler(err);
    }
});

module.exports = router;