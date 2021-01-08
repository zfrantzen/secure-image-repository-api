let express = require('express');
let router = express.Router();
let upload = require('../config/multer.config.js');
 
const imageWorker = require('../controllers/image.controller.js');

router.post('/image', upload.single("image"), imageWorker.postImage);
 
router.get('/image', upload.none(), imageWorker.getImage);

router.get('/image/info', upload.none(), imageWorker.getImageInfo);

router.delete('/image/:imageId', upload.none(), imageWorker.deleteImage);
 
module.exports = router;
