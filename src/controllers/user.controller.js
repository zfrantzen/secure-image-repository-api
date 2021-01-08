const validator = require('../validators/general.validator.js');
const util = require('../utils/util.js');

const userService = require('../services/user.service.js');

module.exports = {
    async postUserController(req, res) {
        try {
            // Validate request fields
            validator.validateRequest({
                expectedBody: ['password'], actualBody: req.body, intBody: false
            });

            // Execute post
            await userService.postUser(
                req.body.password
            ).then(result => res.json(result));
        }
        catch(err) {
            util.handleError(err, res);
        }
    },

    async getAllUsersController(req, res) {
        try {
            // Execute query
            await userService.getAllUsers().then(result => res.json(result));
        }
        catch(err) {
            util.handleError(err, res);
        }
    }
};
