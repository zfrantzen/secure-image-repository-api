const util = require('../utils/util.js');

const authService = require('../services/auth.service.js');
const validatorService = require('../services/validator.service.js');
const imageService = require('../services/image.service.js');

module.exports = {
    async postImageController(req, res) {
        try {
            // Validate request fields
            validatorService.validateRequest({
                expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false,
                expectedBody: ['is-private'], actualBody: req.body,
                imagePresent: true, image: req.file
            });

            // Authenticate user
            let userId = await authService.authenticateUser(req.headers['authorization']);

            // Execute post
            await imageService.postImage(
                userId, 
                req.file, 
                req.body['is-private']
            ).then(result => res.json(result));
        }
        catch(err) {
            util.handleError(err, res);
        }
    },

    async putImageTransferController(req, res) {
        try {
             // Validate request fields
             validatorService.validateRequest({
                expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false,
                expectedBody: ['send-to-user-id', 'image-id'], actualBody: req.body
            });

            // Authenticate user
            userId = await authService.authenticateUser(req.headers['authorization']);

            // Execute transfer
            await imageService.transferImage(
                userId,
                req.body['send-to-user-id'],
                req.body['image-id']
            ).then(result => res.json(result));
        }
        catch(err) {
            util.handleError(err, res);
        }
    },

    async getImageController(req, res) {
        try {
            // Validate request fields
            validatorService.validateRequest({
                expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false,
                expectedQuery: ['image-id'], actualQuery: req.query
            });

            // Authenticate user
            userId = await authService.authenticateUser(req.headers['authorization']);

            // Execute query
            await imageService.getImage(
                userId, 
                req.query['image-id']
            ).then(result => {
                res.set('Content-disposition', 'attachment; filename=' + result.file.name);
                res.set('Content-Type', result.file.type);
                result.readStream.pipe(res);
            });
        }
        catch(err) {
            util.handleError(err, res);
        }
    },

    async getImageInfoController(req, res) {
        try {
            // Validate request fields
            validatorService.validateRequest({expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false});

            // Authenticate user
            userId = await authService.authenticateUser(req.headers['authorization']);

            // Route request to appropraite handler service function
            if (req.query['image-id'] !== undefined) {
                await imageService.getSingleImageInfo(
                    userId,
                    req.query['image-id']
                ).then(result => res.json(result));
            }
            else {
                await imageService.getAllImageInfoForUser(
                    userId
                ).then(result => res.json(result));
            }
        }
        catch(err) {
            util.handleError(err, res);
        }
    },

    async getAllPublicImageInfoController(req, res) {
        try {
            // Execute query
            await imageService.getAllImageInfoPublic().then(result => res.json(result));
        }
        catch(err) {
            util.handleError(err, res);
        }
    },

    async deleteImageController(req, res) {
        try {
            // Validate request fields
            validatorService.validateRequest({expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false});

            // Authenticate user
            userId = await authService.authenticateUser(req.headers['authorization']);

            // Execute delete
            await imageService.deleteImage(
                userId, 
                req.params.imageId
            ).then(result => res.json(result));
        }
        catch(err) {
            util.handleError(err, res);
        }
    }
};
