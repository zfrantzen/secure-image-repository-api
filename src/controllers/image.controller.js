var stream = require('stream');
 
const db = require('../config/db.config.js');
const response = require('../constants/response.constants.js');
const validator = require('../validators/general.validator.js');

const authService = require('../services/auth.service.js');
const imageService = require('../services/image.service.js');

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
    postImageController : (req, res) => {
        // Validate request fields
        let validResult = validator.validateRequest({
            expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false,
            expectedBody: ['is-private'], actualBody: req.body,
            imagePresent: true, image: req.file
        });
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
            return;
        }

        // Authenticate user
        // TODO: NEED TO PUT ALL CODE INCLUDING THIS IN A TRY BLOCK WHEN REFACTORING (CAN THROW ERROR)
        userId = authService.authenticateUser(req.headers['authorization']);

        // Execute post
        Image.create({
            type: req.file.mimetype,
            name: req.file.originalname,
            isPrivate: req.body['is-private'],
            userId: userId,
            data: req.file.buffer
        }).then((data) => {
            res.json({msg: 'Image Successfully Added', imageId: data.id});
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    },

    getImageController : (req, res) => {
        // Validate request fields
        let validResult = validator.validateRequest({
            expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false,
            expectedQuery: ['image-id'], actualQuery: req.query
        });
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
            return;
        }

        // Authenticate user
        // TODO: NEED TO PUT ALL CODE INCLUDING THIS IN A TRY BLOCK WHEN REFACTORING (CAN THROW ERROR)
        userId = authService.authenticateUser(req.headers['authorization']);
        
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
            if (!validator.hasImagePermission(file, userId)) {
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

    getImageInfoController : (req, res) => {
        // Validate request fields
        let validResult = validator.validateRequest({expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false});
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
            return;
        }

        // Authenticate user
        // TODO: NEED TO PUT ALL CODE INCLUDING THIS IN A TRY BLOCK WHEN REFACTORING (CAN THROW ERROR)
        userId = authService.authenticateUser(req.headers['authorization']);

        // Route the request to the appropraite handler function
        if (req.query['image-id'] !== undefined) {
            getSingleImageInfo(
                req.query['image-id'],
                userId,
                res
            );
        }
        else {
            getAllImageInfoForUser(
                userId,
                res
            );
        }
    },

    deleteImageController : (req, res) => {
        // Validate request fields
        let validResult = validator.validateRequest({expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false});
        if (!validResult.isValid) {
            res.status(response.INVALID_REQUEST).json({msg: validResult.messages});
            return;
        }

        // Authenticate user
        // TODO: NEED TO PUT ALL CODE INCLUDING THIS IN A TRY BLOCK WHEN REFACTORING (CAN THROW ERROR)
        userId = authService.authenticateUser(req.headers['authorization']);

        // Execute delete
        Image.destroy({
            where: {
                userId: userId,
                id: req.params.imageId
            }
        }).then(() => {
            res.sendStatus(response.SUCCESS);
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    }
};
