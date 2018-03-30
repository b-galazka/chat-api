module.exports = (err, req, res, next) => {

    const { message } = err;

    console.error(err);

    res.status(403).send({ message });
};