var stream = require('stream');
 
const response = require('../constants/response.constants.js');
const db = require('../config/db.config.js');
const Image = db.images;

module.exports = {
    postImage : (req, res) => {
        Image.create({
            type: req.file.mimetype,
            name: req.file.originalname,
            isPrivate: req.body.isPrivate,
            userId: req.body.userId,
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
                id: req.params.imageId
            }
        }).then(reqResp => {
            const file = reqResp[0].dataValues;

            // Check if we found any data
            if (file.length === 0) {
                res.json(file);
                return;
            }
            
            // Confirm file permissions
            if (file.isPrivate && req.body.userId != file.userId) {
                res.status(response.NO_PERMISSION).json({msg: 'Image is private. User does not have permission to view image.'});
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
        Image.findAll(
            {
                attributes: ['id', 'name', 'type', 'isPrivate', 'createdAt'],
                where: {
                    id: req.params.imageId,
                    userId: req.body.userId
                }
            }
        ).then(files => {
            res.json(files);
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    },

    getAllImageInfoForUser : (req, res) => {
        Image.findAll(
            {
                attributes: ['id', 'name', 'type', 'isPrivate', 'createdAt'],
                where: {
                    userId: req.params.userId
                }
            }
        ).then(files => {
            res.json(files);
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    },

    deleteImage : (req, res) => {
        Image.destroy({
            where: {
                userId: req.body.userId,
                id: req.params.imageId
            }
        }).then(() => {
            res.sendStatus(response.SUCCESS);
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    }
};
