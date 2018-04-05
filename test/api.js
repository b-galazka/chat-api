const request = require('supertest');
const expect = require('chai').expect;
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const app = require('../index').app;
const User = require('../models/User');
const Message = require('../models/Message');
const { createUsers, createMessages, truncateTable } = require('./functions');
const userSchema = require('../validationSchemas/user');
const usernameAvailabilityRequestSchema = require('../validationSchemas/usernameAvailabilityRequest');
const messagesQueryUrlStringSchema = require('../validationSchemas/messagesUrlQueryString');
const { jwtSecret, jwtTtl } = require('../config');

describe('/users GET without an Authorization header', () => {

    it('should respond with a JSON with a message "no authorization header provided"', (done) => {

        request(app)
            .get('/users')
            .expect(403)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'no authorization header provided'
                });

                done();
            });
    });
});

describe('/users GET with an invalid Authorization header', () => {

    it('should respond with a JSON with a message ' +
        '"invalid authorization header provided"', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', 'xxx')
            .expect(403)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'invalid authorization header provided'
                });

                done();
            });
    });
});

describe('/users GET with an Authorization header other than Bearer', () => {

    it('should respond with a JSON with a message ' +
        '"invalid authorization header provided"', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', 'Basic xxx')
            .expect(403)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'invalid authorization header provided'
                });

                done();
            });
    });
});

describe('/users GET with an invalid token', () => {

    it('should respond with a JSON with a message "invalid token"', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', 'Bearer xxx.xxx.xxx')
            .expect(401)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'invalid token'
                });

                done();
            });
    });
});

describe('/users GET with an expired token', () => {

    it('should respond with a JSON with a message "expired token"', (done) => {

        const token = jwt.sign({}, jwtSecret, { expiresIn: 1 });

        setTimeout(() => {

            request(app)
                .get('/users')
                .set('Authorization', `Bearer ${token}`)
                .expect(401)
                .then((res) => {

                    expect(res.body).to.be.eql({
                        message: 'expired token'
                    });

                    done();
                });

        }, 1010);  
    });
});

describe('/users GET with a valid token', () => {

    const numberOfUsers = 10;

    let token;

    before(async () => {

        token = jwt.sign({}, jwtSecret, { expiresIn: '1h' });

        await createUsers(numberOfUsers); 
    });

    after(async () => {

        await truncateTable(User);
    });

    it('should respond with all users', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(numberOfUsers);

                done();
            });
    });

    it('should respond with users only with id and username', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((user) => {

                    expect(user).to.have.all.keys(['id', 'username']);
                });

                done();
            });
    });

    it('should respond with users with id\'s which are numbers', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((user) => {

                    expect(user.id).to.be.a('number');
                });

                done();
            });
    });

    it('should respond with users with usernames which are strings', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((user) => {

                    expect(user.username).to.be.a('string');
                });

                done();
            });
    });

    it('should respond with users sorted by username ascending', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                const sortedUsers = res.body.slice().sort((a, b) => {

                    const aUsername = a.username;
                    const bUsername = b.username;

                    if (aUsername === bUsername) {

                        return 0;
                    }

                    return (aUsername > bUsername) ? 1 : -1;
                });

                expect(res.body).to.be.eql(sortedUsers);

                done();
            });
    });
});

describe('/users POST', () => {

    before(async () => {

        await truncateTable(User);
    });

    afterEach(async () => {

        await truncateTable(User);
    });

    it('should respond with a JSON message if request body is empty', (done) => {

        const reqBody = {};
        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if request body has only username', (done) => {

        const reqBody = { username: 'user' };
        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if request body has only password', (done) => {

        const reqBody = { password: 'zaq1@WSX' };
        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if username is not a string', (done) => {

        const reqBody = {
            username: 50,
            password: 'zaq1@WSX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if password is not a string', (done) => {

        const reqBody = {
            username: 'user',
            password: 50
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message ' +
        'if username is less than 4 characters length', (done) => {

        const reqBody = {
            username: 'xxx',
            password: 'zaq1@WSX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message ' +
        'if username is more than 16 characters length', (done) => {

        const reqBody = {
            username: 'examplelongusernm',
            password: 'zaq1@WSX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message' +
        'if username has characters other than a-Z, 0-9 and _', (done) => {

        const reqBody = {
            username: 'usern@me',
            password: 'zaq1@WSX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message' +
        'if password is less than 8 characters length', (done) => {

        const reqBody = {
            username: 'username',
            password: 'z1@Waaa'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message' +
        'if password is more than 32 characters length', (done) => {

        const reqBody = {
            username: 'username',
            password: 'zaq1@WSXzaq1@WSXzaq1@WSXzaq1@WSX1'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if password doesn\'t have any digit', (done) => {

        const reqBody = {
            username: 'username',
            password: 'zaq@WSXX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message ' +
        'if password doesn\'t have any lower case letter', (done) => {

        const reqBody = {
            username: 'username',
            password: 'ZAQ1@WSX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message ' +
        'if password doesn\'t have any upper case letter', (done) => {

        const reqBody = {
            username: 'username',
            password: 'zaq1@wsx'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message ' +
        'if password doesn\'t have any special character', (done) => {

        const reqBody = {
            username: 'username',
            password: 'zaq12WSX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/users')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message "provided username is being used" ' +
        'if username is currently being used', (done) => {

        const reqBody = {
            username: 'username',
            password: 'zaq1@WSX'
        };

        User.create(reqBody)
            .then((user) => {

                return request(app)
                    .post('/users')
                    .send(reqBody)
                    .expect(409)
                    .then((res) => {

                        expect(res.body).to.be.eql({
                            message: 'provided username is being used'
                        });

                        done();
                    })
            });
    });

    it('shouldn\'t create a user if request body is invalid', (done) => {

        request(app)
            .post('/users')
            .send({
                username: 'abc',
                password: 'zaq1'
            })
            .expect(400)
            .then((res) => {

                return User.findAll({}).then((users) => {

                    expect(users).to.have.lengthOf(0);

                    done();
                });
            });
    });

    it('should create a user with hashed password and correct username', (done) => {

        const username = 'user';
        const password = 'zaq1@WSX';
        const hashedPassowrd = User.generateHash(password);

        request(app)
            .post('/users')
            .send({
                username,
                password
            })
            .expect(201)
            .then((res) => {

                return User.findOne({
                    where: { username, password } 
                })
                .then((user) => {

                    expect(user.username).to.be.eql(username);
                    expect(user.password).to.be.eql(hashedPassowrd);

                    done();
                });
            });
    });

    it('should respond with username and id of created user', (done) => {

        request(app)
            .post('/users')
            .send({
                username: 'user',
                password: 'zaq1@WSX'
            })
            .expect(201)
            .then((res) => {

                return User.findOne().then((user) => {

                    expect(res.body).to.have.all.keys(['username', 'id']);
                    expect(res.body.username).to.be.eql(user.username);
                    expect(res.body.id).to.be.eql(user.id);

                    done();
                });
            });
    });
});

describe('/users/username-availability POST', () => {

    before(async () => {

        await truncateTable(User);

        await User.create({
            username: 'user',
            password: 'zaq1@WSX'
        });
    });

    after(async () => {

        await truncateTable(User);
    });

    it('should respond with a JSON with a "free" field with false value ' + 
        'if username is being used and an username', (done) => {

        request(app)
            .post('/users/username-availability')
            .send({ username: 'user' })
            .expect(200)
            .then((res) => {

                expect(res.body).to.be.eql({
                    username: 'user',
                    free: false
                });

                done();
            });
    });

    it('should respond with a JSON with a "free" field with true value ' +
        'if username is not being used and an username', (done) => {

        request(app)
            .post('/users/username-availability')
            .send({ username: 'otherUser' })
            .expect(200)
            .then((res) => {

                expect(res.body).to.be.eql({
                    username: 'otherUser',
                    free: true
                });

                done();
            });
    });

    it('should trim an username', (done) => {

        request(app)
            .post('/users/username-availability')
            .send({ username: ' user ' })
            .expect(200)
            .then((res) => {

                expect(res.body).to.be.eql({
                    username: ' user ',
                    free: false
                });

                done();
            });
    });

    it('should resposnd with a JSON error if username is not a string', (done) => {

        const reqBody = { username: true };
        const { error } = Joi.validate(reqBody, usernameAvailabilityRequestSchema);

        request(app)
            .post('/users/username-availability')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should resposnd with a JSON error if username is not sent', (done) => {

        const reqBody = {};
        const { error } = Joi.validate(reqBody, usernameAvailabilityRequestSchema);

        request(app)
            .post('/users/username-availability')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });
});

describe('/messages GET without an Authorization header', () => {

    it('should respond with a JSON with a message "no authorization header provided"', (done) => {

        request(app)
            .get('/messages')
            .expect(403)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'no authorization header provided'
                });

                done();
            });
    });
});

describe('/messages GET with an invalid Authorization header', () => {

    it('should respond with a JSON with a message ' +
        '"invalid authorization header provided"', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', 'xxx')
            .expect(403)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'invalid authorization header provided'
                });

                done();
            });
    });
});

describe('/messages GET with an Authorization header other than Bearer', () => {

    it('should respond with a JSON with a message ' +
        '"invalid authorization header provided"', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', 'Basic xxx')
            .expect(403)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'invalid authorization header provided'
                });

                done();
            });
    });
});

describe('/messages GET with an invalid token', () => {

    it('should respond with a JSON with a message "invalid token"', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', 'Bearer xxx.xxx.xxx')
            .expect(401)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'invalid token'
                });

                done();
            });
    });
});

describe('/messages GET with an expired token', () => {

    it('should respond with a JSON with a message "expired token"', (done) => {

        const token = jwt.sign({}, jwtSecret, { expiresIn: 1 });

        setTimeout(() => {

            request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .expect(401)
                .then((res) => {

                    expect(res.body).to.be.eql({
                        message: 'expired token'
                    });

                    done();
                });

        }, 1010);
    });
});

describe('/messages GET with a valid token', () => {

    const numberOfMessages = 10;

    let token;

    before(async () => {

        token = jwt.sign({}, jwtSecret, { expiresIn: '1h' });

        await Promise.all([
            truncateTable(User),
            truncateTable(Message)
        ]);

        const user = await User.create({
            username: 'user',
            password: 'zaq1@WSX'
        });

        await createMessages(numberOfMessages, user);
    });

    after(async () => {

        await Promise.all([
            truncateTable(User),
            truncateTable(Message)
        ]);
    });

    it('should respond with a JSON with a message' +
        'if GET variable "before" is not a positive number', (done) => {

        const query = {
            before: '-10'
        };

        const { error } = Joi.validate(query, messagesQueryUrlStringSchema);

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .query(query)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON with a message' +
        'if GET variable "limit" is not a positive number', (done) => {

        const query = {
            limit: '-10'
        };

        const { error } = Joi.validate(query, messagesQueryUrlStringSchema);

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .query(query)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON with a message' +
        'if GET variable "skip" is not a positive number', (done) => {

        const query = {
            skip: '-10'
        };

        const { error } = Joi.validate(query, messagesQueryUrlStringSchema);

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .query(query)
            .expect(400)
            .then((res) => {
    
                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON with a message' +
        'if unknown GET variable is provided', (done) => {

        const query = {
            unknownVariable: '10'
        };

        const { error } = Joi.validate(query, messagesQueryUrlStringSchema);

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .query(query)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with an array with all messages by default', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(numberOfMessages);

                done();
            });
    });

    it('should respond with messages objects ' +
        'which have id, content, date and author keys', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((message) => {

                    expect(message).to.have.all.keys(
                        ['id', 'content', 'date', 'author']
                    );
                });

                done();
            });
    });

    it('should respond with messages objects ' +
        'which id\'s are numbers', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((message) => {

                    expect(message.id).to.be.a('number');
                });

                done();
            });
    });

    it('should respond with messages objects ' +
        'which contents are strings', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((message) => {

                    expect(message.content).to.be.a('string');
                });

                done();
            });
    });

    it('should respond with messages objects ' +
        'which creation dates are valid', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((message) => {

                    const dateString = new Date(message.date).toString();

                    expect(dateString).to.be.not.equal('Invalid Date');
                });

                done();
            });
    });

    it('should respond with messages objects ' +
        'which authors are objects with username field with string value', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((message) => {

                    const { author } = message;

                    expect(author).to.be.an('object');
                    expect(author).to.have.all.keys(['username']);
                    expect(author.username).to.be.a('string');
                });

                done();
            });
    });

    it('should respond with an array with messages sorted by time ascending', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .query({
                skip: 5,
                limit: 3
            })
            .expect(200)
            .then((res) => {

                expect(res.body).to.be.an('array');

                res.body.reduce((prev, current) => {

                    expect(prev.id < current.id).to.be.eql(true);

                    return current;

                }, { id: 0 });

                done();
            });
    });

    it('should skip a specified number of records from the end', (done) => {

        const skip = 3;

        Message.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({ skip })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(numberOfMessages - skip);
                    expect(res.body[0].id).to.be.eql(messages[0].id);

                    done();
                });
        });
    });

    it('shouldn\'t skip any record if GET variable "skip" is not provided', (done) => {

        Message.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(numberOfMessages);
                    expect(res.body[0].id).to.be.eql(messages[0].id);

                    done();
                });
        });
    });

    it('should limit records to a specified number', (done) => {

        const limit = 10;

        Message.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({ limit })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(limit);
                    expect(res.body[0].id).to.be.eql(messages[numberOfMessages - limit].id);

                    done();
                });
        });
    });

    it('shouldn\'t limit records if GET variable "limit" is not provided', (done) => {

        Message.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(numberOfMessages);
                    expect(res.body[0].id).to.be.eql(messages[0].id);

                    done();
                });
        });
    });

    it('should respond with records older than a record with specified ID', (done) => {

        Message.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        .then((messages) => {
            const index = Math.floor(numberOfMessages / 2);
            const id = messages[index].id;

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({ before: id })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(index);
                    expect(res.body[0].id).to.be.eql(messages[0].id);

                    done();
                });
        });
    });
});

describe('/auth POST', () => {

    before(async () => {

        await truncateTable(User);

        await User.create({
            username: 'userName',
            password: 'zaq1@WSX'
        });
    });

    after(async () => {

        await truncateTable(User);
    });

    it('should respond with a JSON message if request body is empty', (done) => {

        const reqBody = {};
        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/auth')
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if request body has only username', (done) => {

        const reqBody = { username: 'userName' };
        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/auth')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if request body has only password', (done) => {

        const reqBody = { password: 'zaq1@WSX' };
        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/auth')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if username is not a string', (done) => {

        const reqBody = {
            username: 50,
            password: 'zaq1@WSX'
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/auth')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message if password is not a string', (done) => {

        const reqBody = {
            username: 'userName',
            password: 50
        };

        const { error } = Joi.validate(reqBody, userSchema);

        request(app)
            .post('/auth')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            });
    });

    it('should respond with a JSON message ' +
        'if wrong username or password has been sent', (done) => {

        request(app)
            .post('/auth')
            .send({
                username: 'userName',
                password: 'wrong_password'
            })
            .expect(403)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'wrong username or password'
                });

                done();
            });
    });

    it('shouldn\'t care about letters case in username', (done) => {

        request(app)
            .post('/auth')
            .send({
                username: 'userNAME',
                password: 'zaq1@WSX'
            })
            .expect(200)
            .then((res) => {

                const { token } = res.body;

                expect(res.body).to.be.an('object');
                expect(token).to.be.a('string');

                jwt.verify(token, jwtSecret);

                done();
            });
    });

    it(`should respond with a JWT token valid for the next ` +
        `${isNaN(jwtTtl) ? jwtTtl : ms(jwtTtl)}`, (done) => {

        request(app)
            .post('/auth')
            .send({
                username: 'userName',
                password: 'zaq1@WSX'
            })
            .expect(200)
            .then((res) => {

                const { token } = res.body;

                expect(res.body).to.be.an('object');
                expect(token).to.be.a('string');

                const { iat, exp } = jwt.verify(token, jwtSecret);
                const timeDiff = (exp - iat) * 1000;

                expect(timeDiff).to.be.eql(isNaN(jwtTtl) ? ms(jwtTtl) : jwtTtl);

                done();     
            });
    });
});

describe('/not-existing-route without an auth header', () => {

    it('should respond with a JSON with a "not found" message', (done) => {

        request(app)
            .get('/not-existing-route')
            .expect(404)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'not found'
                });

                done();
            });
    });
});

describe('/not-existing-route with an auth header', () => {

    let token;

    before(() => {

        token = jwt.sign({}, jwtSecret, { expiresIn: '1h' });
    });

    it('should respond with a JSON with a "not found" message', (done) => {

        request(app)
            .get('/not-existing-route')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'not found'
                });

                done();
            });
    });
});