const router = require('express').Router();

const User = require('../models/user');
const hash = require('../functions/hash');
const registrationDataValidation = require('../middlewares/registrationDataValidation');
const authorization = require('../middlewares/authorization');
const usernameAvailabilityRequestValidation = require('../middlewares/usernameAvailabilityRequestValidation');

router.post('/', registrationDataValidation);
router.get('/', authorization);
router.post('/username-availability', usernameAvailabilityRequestValidation);

router.get('/', async (req, res) => {

    try {

        const users = await User.find(
            {},
            { username: true, _id: true },
            { sort: { username: 1 } }
        );

        res.send(users);
    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

router.post('/', async (req, res) => {

    try {

        const { username, password } = req.body;

        const createdUser = await User.create({
            username,
            password: hash(password)
        });

        res.status(201).send({
            username: createdUser.username,
            _id: createdUser._id
        });
    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

router.post('/username-availability', async (req, res) => {

    try {

        const { username } = req.body;

        const user = await User.findOne(
            { username: new RegExp(`^${username.trim()}$`, 'i') }, 
            { _id: true }
        );

        res.send({
            username,
            free: (user) ? false : true
        });
    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: 'something went wrong'
        });
    }
});

module.exports = router;