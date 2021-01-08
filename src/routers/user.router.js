let express = require('express');
let router = express.Router();
let multer = require('../config/multer.config.js');

const userWorker = require('../controllers/user.controller.js');

router.post('/user', multer.none(), userWorker.postUserController);

router.get('/user', userWorker.getAllUsersController);

module.exports = router;
