module.exports = (err, req, res, next) => {

    if (err) {

        console.error(err);

        return res.status(500).send({
            message: 'invalid JSON format'
        });
    }

    next();
};