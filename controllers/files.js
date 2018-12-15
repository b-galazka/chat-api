const SavedFile = require('../models/SavedFile');

exports.getFileById = async (req, res, next) => {

    try {

        const { id } = req.params;
        const { action, name } = req.query;

        const file = await SavedFile.findById(~~id);

        if (!file) {

            return res.status(404).send({ message: 'not found' });
        }

        if (action === 'download') {

            return res.download(file.path, name, err => err && next(err));
        }

        res.sendFile(file.path, err => err && next(err));

    } catch (err) {

        next(err);
    }
};