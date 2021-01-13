var stream = require('stream');

const formatter = require('../utils/formatter.js');
const response = require('../constants/response.constants.js');

const securityService = require('./secuity.service.js');
const validatorService = require('./validator.service.js');

const db = require('../config/db.config.js');
const userService = require('./user.service.js');
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

    async transferImage(userId, transferToUserId, imageId) {
        // Confirm ids are different
        if (userId === transferToUserId) {
            return new Promise((resolve, reject) => 
                reject(formatter.formatResponse('Cannot transfer image to yourself', 
                    'send-to-user-id was the same as the userId provided in the authorization header', response.INVALID_REQUEST))
            );
        }

        // Confirm other user exists
        await userService.getUser(transferToUserId).catch((data) => { 
            return new Promise((resolve, reject) => reject(data));
        });
        
        // Get image details
        var image;
        await this.getImage(userId, imageId)
        .then((data) => image = data.file)
        .catch((data) => { 
            return new Promise((resolve, reject) => reject(data)); 
        });

        // Transfer image encrpytion and update database
        let imageBuffer = image.data;
        imageBuffer = await securityService.decrpytImage(userId, imageBuffer);
        imageBuffer = await securityService.encryptImage(transferToUserId, imageBuffer);

        return new Promise((resolve, reject) => {
            Image.update({
                userId: transferToUserId,
                data: imageBuffer
            }, {
                where: {
                    id: imageId
                }
            }).then(data => {
                resolve(formatter.formatResponse('Image with image-id=' + imageId + ' has been transfered', null, response.SUCCESS));
            }).catch(err => {
                reject(formatter.formatResponse('Query error!', err, response.GENERIC_SERVER_ERROR));
            });
        });
    },

    async getImage(userId, imageId) {
        var imageBuffer;
        var foundData;

        await Image.findOne({
            where: {
                id: imageId
            }
        }).then(data => foundData = data)
        .catch(err => {
            return new Promise((resolve, reject) => reject(formatter.formatResponse('Query error!', err, response.GENERIC_SERVER_ERROR)));
        });

        // Check if we found any data
        if (foundData.length === 0) {
            return new Promise((resolve, reject) => reject(formatter.formatResponse('No image with image-id=' + imageId + ' was found', null, response.NOT_FOUND)));
        }

        const file = foundData.dataValues;
        
        // Confirm file permissions
        if (!validatorService.hasImagePermission(file, userId)) {
            return new Promise((resolve, reject) => reject(formatter.formatResponse('No permission', 'Image is private. User does not have permission for this image.', response.NO_PERMISSION)));
        }

        imageBuffer = file.data;

        // Decrpyt image if permissions are set to private
        if (file.isPrivate) {
            imageBuffer = await securityService.decrpytImage(userId, file.data);
        }

        // Prepare data to transmit
        var fileContents = Buffer.from(imageBuffer, "base64");
        var readStream = new stream.PassThrough();
        readStream.end(fileContents);
        return new Promise(resolve => resolve({readStream: readStream, file: file}));
    },

    getSingleImageInfo(userId, imageId) {
        return new Promise((resolve, reject) => {
            Image.findOne(
                {
                    attributes: ['id', 'name', 'type', 'userId', 'isPrivate', 'createdAt'],
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
                if (!validatorService.hasImagePermission(data, userId)) {
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
                    attributes: ['id', 'name', 'type', 'userId', 'isPrivate', 'createdAt'],
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

    getAllImageInfoPublic() {
        return new Promise((resolve, reject) => {
            Image.findAll(
                {
                    attributes: ['id', 'name', 'type', 'userId', 'isPrivate', 'createdAt'],
                    where: {
                        isPrivate: false
                    }
                }
            ).then(data => {
                // Check if we found any data
                if (data.length === 0) {
                    reject(formatter.formatResponse('No public images found!', null, response.NOT_FOUND));
                }
        
                resolve(formatter.formatResponse('Public images found', data, response.SUCCESS));
            }).catch(err => {
                reject(formatter.formatResponse('Query Error!', err, response.GENERIC_SERVER_ERROR));
            });
        });
    },

    deleteImage(userId, imageId) {
        return new Promise(async (resolve, reject) => {
            // Get image to confirm existance and user has permissions (will be checked by the getImage() call)
            await this.getSingleImageInfo(userId, imageId).catch((data) => reject(data));

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
