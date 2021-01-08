var stream = require('stream');

const formatter = require('../utils/formatter.js');
const validator = require('../validators/general.validator.js');
const response = require('../constants/response.constants.js');

const securityService = require('./secuity.service.js');

const db = require('../config/db.config.js');
const Image = db.images;

module.exports = {
    async postImage(userId, image, isPrivate) {
        var imageBuffer = image.buffer;

        // Encrpyt the image prior to upload if permissions set to private
        if (isPrivate) {
            imageBuffer = await securityService.encryptImage(userId, imageBuffer);
        }

        return new Promise((resolve, reject) => {
            Image.create({
                type: image.mimetype,
                name: image.originalname,
                isPrivate: isPrivate,
                userId: userId,
                data: imageBuffer
            }).then((data) => {
                resolve(formatter.formatResponse('Image successfully added', {imageId: data.id}, response.SUCCESS));
            }).catch(err => {
                reject(formatter.formatResponse('Query error!', err, response.GENERIC_SERVER_ERROR));
            });
        });
    },

    async getImage(userId, imageId) {
        return new Promise((resolve, reject) => {
            Image.findAll({
                where: {
                    id: imageId
                }
            }).then(async data => {
                // Check if we found any data
                if (data.length === 0) {
                    reject(formatter.formatResponse('No image with image-id=' + imageId + ' was found', null, response.NOT_FOUND));
                }
    
                const file = data[0].dataValues;
                
                // Confirm file permissions
                if (!validator.hasImagePermission(file, userId)) {
                    reject(formatter.formatResponse('No permission', 'Image is private. User does not have permission for this image.', response.NO_PERMISSION));
                }

                // Decrpyt image if permissions are set to private
                var imageBuffer = file.data;
                if (file.isPrivate) {
                    imageBuffer = await securityService.decrpytImage(userId, file.data);
                }
    
                // Prepare data to transmit
                var fileContents = Buffer.from(imageBuffer, "base64");
                var readStream = new stream.PassThrough();
                readStream.end(fileContents);
                resolve({readStream: readStream, file: file});
            }).catch(err => {
                reject(formatter.formatResponse('Query error!', err, response.GENERIC_SERVER_ERROR));
            });
        });
    },

    getSingleImageInfo(userId, imageId) {
        return new Promise((resolve, reject) => {
            Image.findAll(
                {
                    attributes: ['id', 'name', 'type', 'isPrivate', 'createdAt'],
                    where: {
                        id: imageId,
                        userId: userId
                    }
                }
            ).then(data => {
                // Check if we found any data
                if (data.length === 0) {
                    reject(formatter.formatResponse('No image with image-id=' + imageId + ' was found', null, response.NOT_FOUND));
                }

                // Confirm image permissions
                if (!validator.hasImagePermission(data, userId)) {
                    reject(formatter.formatResponse('No permission', 'Image is private. User does not have permission for this image.', response.NO_PERMISSION));
                }
        
                resolve(formatter.formatResponse('Image with image-id=' + imageId + ' found', data, response.SUCCESS));
            }).catch(err => {
                reject(formatter.formatResponse('Query error!', err, response.GENERIC_SERVER_ERROR));
            });
        });
    },

    getAllImageInfoForUser(userId) {
        return new Promise((resolve, reject) => {
            Image.findAll(
                {
                    attributes: ['id', 'name', 'type', 'isPrivate', 'createdAt'],
                    where: {
                        userId: userId
                    }
                }
            ).then(data => {
                // Check if we found any data
                if (data.length === 0) {
                    reject(formatter.formatResponse('No images for user with userId=' + userId + ' were found', null, response.NOT_FOUND));
                }
        
                resolve(formatter.formatResponse('User images found', data, response.SUCCESS));
            }).catch(err => {
                reject(formatter.formatResponse('Query Error!', err, response.GENERIC_SERVER_ERROR));
            });
        });
    },

    deleteImage(userId, imageId) {
        return new Promise(async (resolve, reject) => {
            // Get image to confirm existance and user has permissions (will be checked by the getImage() call)
            await this.getImage(userId, imageId).catch((data) => reject(data));

            // Execute delete
            Image.destroy({
                where: {
                    userId: userId,
                    id: imageId
                }
            }).then(() => {
                resolve(formatter.formatResponse('Image with image-id=' + imageId + ' was deleted', null, response.SUCCESS))
            }).catch(err => {
                reject(formatter.formatResponse('Query Error!', err, response.GENERIC_SERVER_ERROR));
            });
        });
    }
};
