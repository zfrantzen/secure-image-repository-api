let express = require('express');
let router = express.Router();
let upload = require('../config/multer.config.js');
 
const imageWorker = require('../controllers/image.controller.js');

router.post('/image/upload', upload.single("image"), imageWorker.postImage);
 
router.get('/image/:imageId', upload.none(), imageWorker.getImage);

router.get('/image/info/:imageId', upload.none(), imageWorker.getImageInfo);

router.get('/image/info/user/:userId', upload.none(), imageWorker.getAllImageInfoForUser);

router.delete('/image/:imageId', upload.none(), imageWorker.deleteImage);
 
module.exports = router;
