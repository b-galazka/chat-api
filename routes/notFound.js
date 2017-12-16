const router = require('express').Router();

router.all('*', (req, res) => {

    res.status(404).send({
        message: 'not found'
    });
});

module.exports = router;