const User = require('../models/User');
const Message = require('../models/Message');
const db = require('../db');

const createUsers = (numberOfRecordsToCreate) => {

    const promises = [];

    for (let i = 1; i <= numberOfRecordsToCreate; i++) {

        const promise = User.create({
            username: `user ${i}`,
            password: 'password',
            id: i
        });

        promises.push(promise);
    }

    return Promise.all(promises);
};

const createMessages = (numberOfRecordsToCreate, messagesAuthor) => {

    const promises = [];

    for (let i = 0; i < numberOfRecordsToCreate; i++) {

        const promise = Message.create({
            authorId: messagesAuthor.id,
            content: 'Lorem ipsum dolor sit.'
        });

        promises.push(promise);
    }

    return Promise.all(promises);
};

const truncateTable = model => db.transaction(async (transaction) => {

    const options = { transaction };

    await db.query('SET FOREIGN_KEY_CHECKS = 0', options);

    await model.truncate(options);

    await db.query('SET FOREIGN_KEY_CHECKS = 1', options);
});

module.exports = {
    createMessages,
    createUsers,
    truncateTable
};