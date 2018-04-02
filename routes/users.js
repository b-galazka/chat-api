const router = require('express').Router();

const User = require('../models/User');
const checkUsernameAvailability = require('../middlewares/checkUsernameAvailability');
const authorization = require('../middlewares/authorization');
const usernameAvailabilityRequestSchema = require('../validationSchemas/usernameAvailabilityRequest');
const userSchema = require('../validationSchemas/user');
const validateRequestBody = require('../middlewares/validateRequestBody');

router.post('/', validateRequestBody(userSchema));
router.post('/', checkUsernameAvailability);
router.get('/', authorization);
router.post('/username-availability', validateRequestBody(usernameAvailabilityRequestSchema));

router.get('/', async (req, res) => {

    try {

        const users = await User.loadAlphabeticalList();

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

        const createdUser = await User.create({ username, password });

        res.status(201).send({
            username: createdUser.username,
            id: createdUser.id
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

        const user = await User.findOne({
            where: { username }
        });

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