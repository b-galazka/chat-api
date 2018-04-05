const expect = require('chai').expect;
const clientIO = require('socket.io-client');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const { chatSocket } = require('../index');
const { port, ip } = require('../config');
const User = require('../models/User');
const Message = require('../models/Message');
const { truncateTable } = require('./functions');
const { jwtSecret } = require('../config');
const messageSchema = require('../validationSchemas/message');

describe('socket connecting without token', () => {

    it('should emit an "error" event with error object', (done) => {

        const clientSocket = clientIO.connect(`http://${ip}:${port}`);

        clientSocket.on('error', (err) => {

            expect(err).to.be.equal('no token provided');

            done();
        });
    });
});

describe('socket connecting with an invalid or expired token', () => {

    it('should emit an "error" event with error object if provided token is invalid', (done) => {

        const token = 'invalid_token';
        const clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        clientSocket.on('error', (err) => {

            expect(err).to.be.equal('invalid token provided');

            done();
        });
    });

    it('should emit an "error" event with error object if provided token is expired', (done) => {

        const token = jwt.sign({}, jwtSecret, { expiresIn: 1 });

        setTimeout(() => {
            
            const clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token }});

            clientSocket.on('error', (err) => {

                expect(err).to.be.equal('expired token provided');

                done();
            });

        }, 1010);
        
    });
});

describe('socket connecting with a valid token', () => {

    let clientSocket;
    let user1Data;
    let user2Data;

    before(async () => {

        const [user1, user2] = await Promise.all([
            User.create({ username: 'user1', password: 'xxx' }),
            User.create({ username: 'user2', password: 'xxx' })
        ]);

        user1Data = { username: user1.username, id: user1.id };
        user2Data = { username: user2.username, id: user2.id };
    });

    beforeEach(() => {

        const token = jwt.sign(user1Data, jwtSecret, { expiresIn: '1h' });

        clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });
    });

    afterEach(async () => {

        clientSocket.disconnect();

        await truncateTable(Message); 
    });

    after(async () => {

        await truncateTable(User);
    });

    it('should emit an event "users" with a valid list of users to all connected clients ' +
        'when some client has been connected', (done) => {

        User.findAll({

            attributes: ['username', 'id'],

            order: [
                ['username', 'ASC']
            ]
        })
        .then(([user1, user2]) => {

            const token = jwt.sign(user2Data, jwtSecret, { expiresIn: '1h' })
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let secondClientConnected = false;

            clientSocket.on('users', (users) => {

                if (secondClientConnected) {

                    expect(users).to.be.eql([
                        { username: user1.username, id: user1.id, connected: true },
                        { username: user2.username, id: user2.id, connected: true }
                    ]);

                    clientSocket2.disconnect();
                    clientSocket.disconnect();

                    done();                
                } else {

                    expect(users).to.be.eql([
                        { username: user1.username, id: user1.id, connected: true },
                        { username: user2.username, id: user2.id, connected: false }
                    ]);

                    secondClientConnected = true;
                }        
            });
        });
    });

    it('should emit an event "expired token" with no data ' +
        'when client emits any event and its token is expired', (done) => {

        const token = jwt.sign(user1Data, jwtSecret, { expiresIn: 1 });

        clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('example event');
        }, 1010);

        clientSocket.on('expired token', (data) => {

            expect(data).to.be.equal(undefined);

            done();
        });
    });

    it('should disconnect a socket ' +
        'when client emits any event and its token is expired', (done) => {

        const token = jwt.sign(user1Data, jwtSecret, { expiresIn: 1 });

        clientSocket = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('example event');
        }, 1010);

        clientSocket.on('disconnect', (data) => {

            expect(data).to.be.equal('io server disconnect');

            done();
        });
    });

    it('should emit an event "expired token" with no data to all clients with expired token ' +
        'when another client emits a "message" event', (done) => {

        const token = jwt.sign(user2Data, jwtSecret, { expiresIn: 1 });
        const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('message', { author: 'username', tempID: 1 });
        }, 1010);

        clientSocket2.on('expired token', (data) => {

            expect(data).to.be.equal(undefined);

            done();
        });
    });

    it('should disconnect all clients with expired token ' +
        'when another client emits a "message" event', (done) => {

        const token = jwt.sign(user2Data, jwtSecret, { expiresIn: 1 });
        const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        setTimeout(() => {

            clientSocket.emit('message', { content: 'lorem ipsum', tempID: 1 });
        }, 1010);

        clientSocket2.on('disconnect', (data) => {

            expect(data).to.be.equal('io server disconnect');

            done();
        });
    });

    it('should emit an "users" event with a valid users list after disconnecting all clients ' +
        'with expired tokens by emitting a "message" event', (done) => {

        User.findAll({

            attributes: ['username', 'id'],

            order: [
                ['username', 'ASC']
            ]
        })
        .then(([user1, user2]) => {

            const token = jwt.sign(user2Data, jwtSecret, { expiresIn: 1 });
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let numberOfCalls = 0;

            setTimeout(() => {

                clientSocket.emit('message', { author: 'username', tempID: 1 });
            }, 1010);

            clientSocket.on('users', (users) => {

                if (++numberOfCalls === 3) {

                    expect(users).to.be.eql([
                        { username: user1.username, id: user1.id, connected: true },
                        { username: user2.username, id: user2.id, connected: false }
                    ]);

                    done();
                }    
            });
        });
    });

    it('should emit an "users" event with a valid users list after disconnecting socket ' +
        'with an expired token when it was emitting some event', (done) => {

        User.findAll({

            attributes: ['username', 'id'],

            order: [
                ['username', 'ASC']
            ]
        })
        .then(([user1, user2]) => {

            const token = jwt.sign(user2Data, jwtSecret, { expiresIn: 1 });
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let numberOfCalls = 0;

            setTimeout(() => {

                clientSocket2.emit('example event');
            }, 1010);

            clientSocket.on('users', (users) => {

                if (++numberOfCalls === 3) {

                    expect(users).to.be.eql([
                        { username: user1.username, id: user1.id, connected: true },
                        { username: user2.username, id: user2.id, connected: false }
                    ]);

                    done();
                }
            });
        });
    });

    it('should emit an "users" event with a valid users list ' +
        'when some client has disconnected', (done) => {

        User.findAll({

            attributes: ['username', 'id'],

            order: [
                ['username', 'ASC']
            ]
        })
        .then(([user1, user2]) => {

            const token = jwt.sign(user2Data, jwtSecret, { expiresIn: '1h' });
            const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

            let numberOfCalls = 0;

            clientSocket.on('users', (users) => {

                if (++numberOfCalls === 3) {

                    expect(users).to.be.eql([
                        { username: user1.username, id: user1.id, connected: true },
                        { username: user2.username, id: user2.id, connected: false }
                    ]);

                    done();
                } else if (numberOfCalls === 1) {

                    clientSocket2.disconnect();
                }
            });
        });
    });

    it('should emit a "message validation error" event with an error ' +
        'if client emits "message" event with an invalid data', (done) => {

        const data = 'message content';
        const { error } = Joi.validate(data, messageSchema);

        clientSocket.emit('message', data);

        clientSocket.on('message validation error', (res) => {

            expect(res).to.be.equal(error.message);

            done();
        });
    });

    it('shouldn\'t save a messsage in DB ' +
        'if client emits "message" event with an invalid data', (done) => {

        const data = 'message content';
        const { error } = Joi.validate(data, messageSchema);

        clientSocket.emit('message', data);

        clientSocket.on('message validation error', (res) => {

            Message.findAll()
                .then((messages) => {

                    expect(messages).to.have.lengthOf(0);

                    done();
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

            const { message } = res;

            expect(res.tempID).to.be.equal(data.tempID);
            expect(message.content).to.be.equal('lorem ipsum');
            expect(new Date(message.date)).to.not.equal('Invalid Date');

            expect(message.author).to.be.eql({
                username: user1Data.username
            });

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

            Message.findOne({
                
                where: {
                    content: data.content,
                    authorId: user1Data.id
                }
            })
            .then((message) => {

                expect(message).to.be.an('object');

                done();
            });
        });
    });

    it('should emit a "message" event with a saved message object to all clients ' +
        'excepting client which sent a message', (done) => {

        const token = jwt.sign(user2Data, jwtSecret, { expiresIn: '1h' })
        const clientSocket2 = clientIO.connect(`http://${ip}:${port}`, { query: { token } });

        const data = {
            content: 'lorem ipsum',
            tempID: 1
        };

        clientSocket2.emit('message', data);

        clientSocket2.on('message', () => {

            throw new Error('This event should not be emitted');
        });

        clientSocket.on('message', (res) => {

            expect(res.tempID).to.be.equal(undefined);
            expect(res.content).to.be.equal('lorem ipsum');
            expect(new Date(res.date)).to.not.equal('Invalid Date');

            expect(res.author).to.be.eql({
                username: user2Data.username
            });

            done();
        });
    });
});