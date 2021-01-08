const validator = require('../validators/general.validator.js');
const util = require('../utils/util.js');

const authService = require('../services/auth.service.js');
const imageService = require('../services/image.service.js');

module.exports = {
    async postImageController(req, res) {
        try {
            // Validate request fields
            validator.validateRequest({
                expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false,
                expectedBody: ['is-private'], actualBody: req.body,
                imagePresent: true, image: req.file
            });

            // Authenticate user
            let userId = authService.authenticateUser(req.headers['authorization']);

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

    async getImageController(req, res) {
        try {
            // Validate request fields
            validator.validateRequest({
                expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false,
                expectedQuery: ['image-id'], actualQuery: req.query
            });

            // Authenticate user
            userId = authService.authenticateUser(req.headers['authorization']);

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
            validator.validateRequest({expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false});

            // Authenticate user
            userId = authService.authenticateUser(req.headers['authorization']);

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

    async deleteImageController(req, res) {
        try {
            // Validate request fields
            validator.validateRequest({expectedHeaders: ['authorization'], actualHeaders: req.headers, intHeaders: false});

            // Authenticate user
            userId = authService.authenticateUser(req.headers['authorization']);

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
