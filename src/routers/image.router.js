let express = require('express');
let router = express.Router();
let upload = require('../config/multer.config.js');
 
const imageWorker = require('../controllers/image.controller.js');

router.post('/image', upload.single("image"), imageWorker.postImageController);
 
router.get('/image', upload.none(), imageWorker.getImageController);

router.get('/image/info', upload.none(), imageWorker.getImageInfoController);

router.delete('/image/:imageId', upload.none(), imageWorker.deleteImageController);
 
module.exports = router;
