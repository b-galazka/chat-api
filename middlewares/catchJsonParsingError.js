module.exports = (err, req, res, next) => {

    console.error(err);

    res.status(500).send({
        message: 'invalid JSON format'
    });
};