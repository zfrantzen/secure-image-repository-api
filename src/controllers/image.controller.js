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
        // Confirm image permissions
        if (!validator.hasImagePermission(data, userId)) {
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
        // Validate request fields
        let validResult = validator.validateRequest({
            expectedHeaders: ['user-id'], actualHeaders: req.headers, 
            expectedBody: ['is-private'], actualBody: req.body,
            imagePresent: true, image: req.file
        });
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
            return;
        }

        // Execute post
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
        // Validate request fields
        let validResult = validator.validateRequest({
            expectedHeaders: ['user-id'], actualHeaders: req.headers, 
            expectedQuery: ['image-id'], actualQuery: req.query
        });
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
            return;
        }
        
        // Execute query
        Image.findAll({
            where: {
                id: req.query['image-id']
            }
        }).then(reqResp => {
            // Check if we found any data
            if (reqResp.length === 0) {
                res.json({msg: 'No image with image-id=' + req.query['image-id'] + ' found'});
                return;
            }

            const file = reqResp[0].dataValues;
            
            // Confirm file permissions
            if (!validator.hasImagePermission(file, req.headers['user-id'])) {
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
        let validResult = validator.validateRequest({expectedHeaders: ['user-id'], actualHeaders: req.headers});
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
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
        // Validate request fields
        let validResult = validator.validateRequest({expectedHeaders: ['user-id'], actualHeaders: req.headers});
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
            return;
        }

        // Execute delete
        Image.destroy({
            where: {
                userId: req.headers['user-id'],
                id: req.params.imageId
            }
        }).then(() => {
            res.sendStatus(response.SUCCESS);
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    }
};
