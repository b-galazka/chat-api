const router = require('express').Router();

const authRoutes = require('./auth');
const usersRoutes = require('./users');
const messagesRoutes = require('./messages');
const notFoundRoutes = require('./notFound');
const filesRoutes = require('./files');
const attachmentsRoutes = require('./attachments');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/messages', messagesRoutes);
router.use('/attachments', attachmentsRoutes);
router.use('/get-file', filesRoutes);
router.use('*', notFoundRoutes);

module.exports = router;