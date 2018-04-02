const request = require('supertest');
const expect = require('chai').expect;
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const app = require('../index').app;
const User = require('../models/User');
const Message = require('../models/Message');
const { createUsers, createMessages } = require('./functions');
const userSchema = require('../validationSchemas/user');
const usernameAvailabilityRequestSchema = require('../validationSchemas/usernameAvailabilityRequest');
const { jwtSecret } = require('../config');

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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
                    message: 'expired or invalid token'
                });

                done();
            })
            .catch((err) => {

                console.error(err);
            });
    });
});

describe('/users GET with a valid token', () => {

    const numberOfUsers = 10;

    let token;

    before((done) => {

        token = jwt.sign({}, jwtSecret, { expiresIn: '1h' });

        User.collection.drop(() => {

            createUsers(numberOfUsers).then(() => {

                done();
            }).catch((err) => {

                console.error(err);
            });
        });
    });

    after((done) => {

        User.collection.drop(() => {

            done();
        });
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
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('should respond with users only with _id and username', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((user) => {

                    expect(user).to.have.all.keys(['_id', 'username']);
                });

                done();
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('should respond with users with _id\'s which are strings', (done) => {

        request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {

                res.body.forEach((user) => {

                    expect(user._id).to.be.a('string');
                });

                done();
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
            });
    });
});

describe('/users POST', () => {

    before((done) => {

        User.collection.drop(() => {

            done();
        });
    });

    afterEach((done) => {

        User.collection.drop(() => {

            done();
        });
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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

                return User.find({}).then((users) => {

                    expect(users).to.have.lengthOf(0);

                    done();
                });
            })
            .catch((err) => {

                console.error(err);
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

                return User.findOne({ username, password }).then((user) => {

                    expect(user.username).to.be.eql(username);
                    expect(user.password).to.be.eql(hashedPassowrd);

                    done();
                });
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('should respond with username and _id of created user', (done) => {

        request(app)
            .post('/users')
            .send({
                username: 'user',
                password: 'zaq1@WSX'
            })
            .expect(201)
            .then((res) => {

                return User.findOne().then((user) => {

                    expect(res.body).to.have.all.keys(['username', '_id']);
                    expect(res.body.username).to.be.eql(user.username);
                    expect(res.body._id).to.be.eql(user._id.toString());

                    done();
                });
            })
            .catch((err) => {

                console.error(err);
            });
    });
});

describe('/users/username-availability POST', () => {

    before((done) => {

        User.collection.drop(() => {

            User.create({
                username: 'user',
                password: 'zaq1@WSX'
            })
            .then(() => {

                done();
            })
            .catch((err) => {

                console.error(err);
            });
        });
    });

    after((done) => {

        User.collection.drop(() => {

            done();
        });
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('should resposnd with a JSON error if username is not a string', (done) => {

        const reqBody = { username: true };

        request(app)
            .post('/users/username-availability')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                const { error } = Joi.validate(reqBody, usernameAvailabilityRequestSchema);

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('should resposnd with a JSON error if username is not sent', (done) => {

        const reqBody = {};

        request(app)
            .post('/users/username-availability')
            .send(reqBody)
            .expect(400)
            .then((res) => {

                const { error } = Joi.validate(reqBody, usernameAvailabilityRequestSchema);

                expect(res.body).to.be.eql({
                    message: error.message
                });

                done();
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
                    message: 'expired or invalid token'
                });

                done();
            })
            .catch((err) => {

                console.error(err);
            });
    });
});

describe('/messages GET with a valid token', () => {

    const numberOfMessages = 10;

    let token;

    before((done) => {

        token = jwt.sign({}, jwtSecret, { expiresIn: '1h' });

        Message.collection.drop(() => {

            createMessages(numberOfMessages).then(() => {

                done();
            }).catch((err) => {

                console.error(err);
            });
        });
    });

    after((done) => {

        Message.collection.drop(() => {

            done();
        });
    });

    it('should respond with a JSON with a message if GET variable "before" is invalid', (done) => {

        request(app)
            .get('/messages')
            .set('Authorization', `Bearer ${token}`)
            .query({
                before: 'lorem_ipsum'
            })
            .expect(500)
            .then((res) => {

                expect(res.body).to.be.eql({
                    message: 'something went wrong'
                });

                done();
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('shoudl respond with an array with messages sorted by time ascending', (done) => {

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
                    expect(prev._id < current._id).to.be.eql(true);

                    return current;
                }, { _id: '' });

                done();
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('should skip a specified number of records from the end', (done) => {

        const skip = 3;

        Message.find({}, {}, {
            sort: {
                _id: 1
            }
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({
                    skip
                })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(numberOfMessages - skip);
                    expect(res.body[0]._id).to.be.eql(messages[0]._id.toString());

                    done();
                });
        })
        .catch((err) => {
            console.error(err);
        });
    });

    it('shouldn\'t skip any record if GET variable "skip" is not a number', (done) => {

        Message.find({}, {}, {
            sort: {
                _id: 1
            }
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({
                    skip: 'lorem ipsum'
                })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(numberOfMessages);
                    expect(res.body[0]._id).to.be.eql(messages[0]._id.toString());

                    done();
                });
        })
        .catch((err) => {
            console.error(err);
        });
    });

    it('should limit records to a specified number', (done) => {

        const limit = 10;

        Message.find({}, {}, {
            sort: {
                _id: 1
            }
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({
                    limit
                })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(limit);
                    expect(res.body[0]._id).to.be.eql(messages[numberOfMessages - limit]._id.toString());

                    done();
                });
        })
        .catch((err) => {
            console.error(err);
        });
    });

    it('shouldn\'t limit records if GET variable "limit" is not a number', (done) => {

        Message.find({}, {}, {
            sort: {
                _id: 1
            }
        })
        .then((messages) => {

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({
                    skip: 'lorem ipsum'
                })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(numberOfMessages);
                    expect(res.body[0]._id).to.be.eql(messages[0]._id.toString());

                    done();
                });
        })
        .catch((err) => {
            console.error(err);
        });
    });

    it('should respond with records older than a record with specified ID', (done) => {

        Message.find({}, {}, {
            sort: {
                _id: 1
            }
        })
        .then((messages) => {
            const index = Math.floor(numberOfMessages / 2);
            const id = messages[index]._id.toString();

            return request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${token}`)
                .query({
                    before: id
                })
                .expect(200)
                .then((res) => {

                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(index);
                    expect(res.body[0]._id).to.be.eql(messages[0]._id.toString());

                    done();
                });
        })
        .catch((err) => {
            console.error(err);
        });
    });
});

describe('/auth POST', () => {

    before((done) => {

        User.create({
            username: 'userName',
            password: 'zaq1@WSX'
        })
        .then(() => {

            done();
        })
        .catch((err) => {

            console.error(err);
        });
    });

    after((done) => {

        User.collection.drop(() => {

            done();
        });
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
            });
    });

    it('should respond with a JWT token valid for the next 24 hours', (done) => {

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

                expect(exp - iat).to.be.eql(60 * 60 * 24);

                done();     
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
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
            })
            .catch((err) => {

                console.error(err);
            });
    });
});