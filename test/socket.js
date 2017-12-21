const expect = require('chai').expect;
const clientIO = require('socket.io-client');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const { chatSocket, port, ip } = require('../index');
const User = require('../models/user');
const Message = require('../models/message');
const { addMessages, addUsers } = require('./functions');
const { jwtSecret } = require('../config');
const messageSchema = require('../validationSchemas/message');

describe('socket connecting with an invalid token or without token', () => {

    it('should emit an "error" event with error object if provided token is invalid', (done) => {

        const token = 'invalid_token';
        const clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        clientSocket.on('error', (err) => {

            expect(err).to.be.eql('invalid token or no token provided');

            done();
        });
    });

    it('should emit an "error" event with error object if token is not provided', (done) => {

        const token = 'invalid_token';
        const clientSocket = clientIO.connect(`http://${ip}:${port}`);

        clientSocket.on('error', (err) => {

            expect(err).to.be.eql('invalid token or no token provided');

            done();
        });
    });
});

describe('socket connecting with a valid token', () => {

    let clientSocket;

    before((done) => {

        const user1 = User.create({
            username: 'user1',
            password: 'xxx'
        });

        const user2 = User.create({
            username: 'user2',
            password: 'xxx'
        });

        Promise.all([user1, user2]).then(() => {

            done();
        }).catch((err) => {

            console.error(err);
        });
    });

    beforeEach(() => {

        const token = jwt.sign({ username: 'user1' }, jwtSecret, { expiresIn: '1h' });

        clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });
    });

    afterEach((done) => {

        Message.collection.drop(() => {

            done();
        });

        clientSocket.disconnect();
    });

    after((done) => {

        User.collection.drop(() => {

            done();
        });
    });

    it('should emit an event "users" with a valid list of users to all connected clients ' +
        'when some client has been connected', (done) => {

        User.find(
            {},
            { username: true, _id: true },
            { sort: { username: 1 } }
        )
        .then(([user1, user2]) => {

            const token = jwt.sign({ username: 'user2' }, jwtSecret, { expiresIn: '1h' })
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let secondClientConnected = false;

            clientSocket.on('users', (users) => {

                if (secondClientConnected) {

                    expect(users).to.be.eql([
                        { username: user1.username, _id: user1._id.toString(), connected: true },
                        { username: user2.username, _id: user2._id.toString(), connected: true }
                    ]);

                    clientSocket2.disconnect();

                    done();                
                } else {

                    expect(users).to.be.eql([
                        { username: user1.username, _id: user1._id.toString(), connected: true },
                        { username: user2.username, _id: user2._id.toString(), connected: false }
                    ]);

                    secondClientConnected = true;
                }        
            });
        })
        .catch((err) => {

            console.error(err);
        });
    });

    it('should emit an event "expired token" with no data ' +
        'when client emits any event and its token is expired', (done) => {

        clientSocket.disconnect();

        const token = jwt.sign({ username: 'user1' }, jwtSecret, { expiresIn: 1 });

        clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('example event');
        }, 1010);

        clientSocket.on('expired token', (data) => {

            expect(data).to.be.eql(undefined);

            done();
        });
    });

    it('should disconnect a socket ' +
        'when client emits any event and its token is expired', (done) => {

        clientSocket.disconnect();

        const token = jwt.sign({ username: 'user1' }, jwtSecret, { expiresIn: 1 });

        clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('example event');
        }, 1010);

        clientSocket.on('disconnect', (data) => {

            expect(data).to.be.eql('io server disconnect');

            done();
        });
    });

    it('should emit an event "expired token" with no data to all clients with expired token ' +
        'when another client emits a "message" event', (done) => {

        const token = jwt.sign({ username: 'user1' }, jwtSecret, { expiresIn: 1 });
        const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('message', { author: 'username', tempID: 1 });
        }, 1010);

        clientSocket2.on('expired token', (data) => {

            expect(data).to.be.eql(undefined);

            done();
        });
    });

    it('should disconnect all clients with expired token ' +
        'when another client emits a "message" event', (done) => {

        const token = jwt.sign({ username: 'user2' }, jwtSecret, { expiresIn: 1 });
        const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('message', { content: 'lorem ipsum', tempID: 1 });
        }, 1010);

        clientSocket2.on('disconnect', (data) => {

            expect(data).to.be.eql('io server disconnect');

            done();
        });
    });

    it('should emit an "users" event with a valid users list after disconnecting all clients ' +
        'with expired tokens by emitting a "message" event', (done) => {

        User.find(
            {},
            { username: true, _id: true },
            { sort: { username: 1 } }
        )
        .then(([user1, user2]) => {

            const token = jwt.sign({ username: 'user2' }, jwtSecret, { expiresIn: 1 });
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let numberOfCalls = 0;

            setTimeout(() => {

                clientSocket.emit('message', { author: 'username', tempID: 1 });
            }, 1010);

            clientSocket.on('users', (users) => {

                if (++numberOfCalls === 3) {

                    expect(users).to.be.eql([
                        { username: user1.username, _id: user1._id.toString(), connected: true },
                        { username: user2.username, _id: user2._id.toString(), connected: false }
                    ]);

                    done();
                }    
            });
        })
        .catch((err) => {

            console.error(err);
        });
    });

    it('should emit an "users" event with a valid users list after disconnecting socket ' +
        'with an expired token when it was emitting some event', (done) => {

        User.find(
            {},
            { username: true, _id: true },
            { sort: { username: 1 } }
        )
        .then(([user1, user2]) => {

            const token = jwt.sign({ username: 'user2' }, jwtSecret, { expiresIn: 1 });
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let numberOfCalls = 0;

            setTimeout(() => {

                clientSocket2.emit('example event');
            }, 1010);

            clientSocket.on('users', (users) => {

                if (++numberOfCalls === 3) {

                    expect(users).to.be.eql([
                        { username: user1.username, _id: user1._id.toString(), connected: true },
                        { username: user2.username, _id: user2._id.toString(), connected: false }
                    ]);

                    done();
                }
            });
        })
        .catch((err) => {

            console.error(err);
        });
    });

    it('should emit an "users" event with a valid users list ' +
        'when some client has disconnected', (done) => {

        User.find(
            {},
            { username: true, _id: true },
            { sort: { username: 1 } }
        )
        .then(([user1, user2]) => {

            const token = jwt.sign({ username: 'user2' }, jwtSecret, { expiresIn: '1h' });
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let numberOfCalls = 0;

            clientSocket.on('users', (users) => {

                if (++numberOfCalls === 3) {

                    expect(users).to.be.eql([
                        { username: user1.username, _id: user1._id.toString(), connected: true },
                        { username: user2.username, _id: user2._id.toString(), connected: false }
                    ]);

                    done();
                } else if (numberOfCalls === 1) {

                    clientSocket2.disconnect();
                }
            });
        })
        .catch((err) => {

            console.error(err);
        });
    });

    it('should emit a "message validation error" event with an error ' +
        'if client emits "message" event with an invalid data', (done) => {

        const data = 'message content';
        const { error } = Joi.validate(data, messageSchema);

        clientSocket.emit('message', data);

        clientSocket.on('message validation error', (res) => {

            expect(res).to.be.eql(error.message);

            done();
        });
    });

    it('shouldn\'t save a messsage in DB ' +
        'if client emits "message" event with an invalid data', (done) => {

        const data = 'message content';
        const { error } = Joi.validate(data, messageSchema);

        clientSocket.emit('message', data);

        clientSocket.on('message validation error', (res) => {

            Message.find()
                .then((messages) => {

                    expect(messages).to.have.lengthOf(0);

                    done();
                })
                .catch((err) => {

                    console.error(err);
                });
        });
    });

    it('should emit a "message saved" event with a saved message object ' +
        'and temporary ID to the client which sent data', (done) => {

        const data = {
            content: 'lorem ipsum',
            tempID: 1
        };

        clientSocket.emit('message', data);

        clientSocket.on('message saved', (res) => {

            expect(res.tempID).to.be.eql(data.tempID);
            expect(res.message.author).to.be.eql('user1');
            expect(res.message.content).to.be.eql('lorem ipsum');
            expect(new Date(res.message.date)).to.not.equal('Invalid Date');

            done();
        });
    });

    it('should save a message in DB', (done) => {

        const data = {
            content: 'lorem ipsum',
            tempID: 1
        };

        clientSocket.emit('message', data);

        clientSocket.on('message saved', (res) => {

            Message.findOne({ content: data.content, author: 'user1' })
                .then((message) => {

                    expect(message).to.be.an('object');

                    done();
                })
                .catch((err) => {

                    console.error(err);
                });
        });
    });

    it('should emit a "message" event with a saved message object to all clients ' +
        'excepting client which sent a message', (done) => {

        const token = jwt.sign({ username: 'user2' }, jwtSecret, { expiresIn: '1h' })
        const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        const data = {
            content: 'lorem ipsum',
            tempID: 1
        };

        clientSocket2.emit('message', data);

        clientSocket.on('message', (res) => {

            expect(res.tempID).to.be.eql(undefined);
            expect(res.author).to.be.eql('user2');
            expect(res.content).to.be.eql('lorem ipsum');
            expect(new Date(res.date)).to.not.equal('Invalid Date');

            done();
        });
    });
});