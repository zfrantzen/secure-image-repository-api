var stream = require('stream');
 
const response = require('../constants/response.constants.js');
const db = require('../config/db.config.js');
const validator = require('../validators/general.validator.js');
const Image = db.images;

function getAllImageInfoForUser(userId, res) {
    Image.findAll(
        {
            attributes: ['id', 'name', 'type', 'isPrivate', 'createdAt'],
            where: {
                userId: userId
            }
        }
    ).then(files => {
        res.json(files);
    }).catch(err => {
        res.status(response.GENERIC_SERVER_ERROR).json({ msg: 'Error', detail: err });
    });
};

function getSingleImageInfo(imageId, userId, res) {
    Image.findAll(
        {
            attributes: ['id', 'name', 'type', 'isPrivate', 'createdAt'],
            where: {
                id: imageId,
                userId: userId
            }
        }
    ).then(data => {
        // Confirm file permissions
        if (data.isPrivate && userId != data.userId) {
            res.status(response.NO_PERMISSION).json({msg: 'Image is private. User does not have permission for this image.'});
            return;
        }
        res.json(data);
    }).catch(err => {
        res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
    });
};

module.exports = {
    postImage : (req, res) => {
        Image.create({
            type: req.file.mimetype,
            name: req.file.originalname,
            isPrivate: req.body['is-private'],
            userId: req.headers['user-id'],
            data: req.file.buffer
        }).then((data) => {
            res.json({msg: 'Image Successfully Added', imageId: data.id});
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    },

    getImage : (req, res) => {
        Image.findAll({
            where: {
                id: req.query['image-id']
            }
        }).then(reqResp => {
            const file = reqResp[0].dataValues;

            // Check if we found any data
            if (file.length === 0) {
                res.json(file);
                return;
            }
            
            // Confirm file permissions
            if (file.isPrivate && req.headers['user-id'] != file.userId) {
                res.status(response.NO_PERMISSION).json({msg: 'Image is private. User does not have permission for this image.'});
                return;
            }

            var fileContents = Buffer.from(file.data, "base64");
            var readStream = new stream.PassThrough();
            readStream.end(fileContents);
            
            res.set('Content-disposition', 'attachment; filename=' + file.name);
            res.set('Content-Type', file.type);
         
            readStream.pipe(res);
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    },

    getImageInfo : (req, res) => {
        // Validate request fields
        let validResult = validator.allPresentIntValidator(['user-id'], req.headers);
        if (!validResult.isValid) {
            res.json(validResult.message);
            return;
        }

        // Route the request to the appropraite handler function
        if (req.query['image-id'] !== undefined) {
            getSingleImageInfo(
                req.query['image-id'],
                req.headers['user-id'],
                res
            );
        }
        else {
            getAllImageInfoForUser(
                req.headers['user-id'],
                res
            );
        }
    },

    deleteImage : (req, res) => {
        Image.destroy({
            where: {
                userId: req.headers['user-id'],
                id: req.params['image-id']
            }
        }).then(() => {
            res.sendStatus(response.SUCCESS);
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    }
};
