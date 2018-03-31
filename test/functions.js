const User = require('../models/User');
const Message = require('../models/Message');

const createUsers = (numberOfRecordsToCreate) => {

    let promises = [];

    for (let i = 0; i < numberOfRecordsToCreate; i++) {

        const promise = User.create({
            username: `user ${i}`,
            password: 'password'
        });

        promises.push(promise);
    }

    return Promise.all(promises);
};

const createMessages = (numberOfRecordsToCreate) => {

    let promises = [];

    for (let i = 0; i < numberOfRecordsToCreate; i++) {

        const promise = Message.create({
            author: `user ${i}`,
            content: 'Lorem ipsum dolor sit.'
        });

        promises.push(promise);
    }

    return Promise.all(promises);
};

module.exports = {
    createMessages,
    createUsers
};