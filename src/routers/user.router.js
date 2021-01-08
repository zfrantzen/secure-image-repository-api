let express = require('express');
let router = express.Router();

const userWorker = require('../controllers/user.controller.js');

router.post('/user', userWorker.postUser);

router.get('/user', userWorker.getAllUsers);

module.exports = router;
