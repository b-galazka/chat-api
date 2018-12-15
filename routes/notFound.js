const router = require('express').Router();

// TODO: add invalid HTTP method handler
router.all('*', (req, res) => {

    res.status(404).send({
        message: 'not found'
    });
});

module.exports = router;