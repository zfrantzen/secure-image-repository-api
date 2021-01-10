const formatter = require('../utils/formatter.js');
const response = require('../constants/response.constants.js');
const userService = require('./user.service.js');

module.exports = {

    // Returns userId upon success, throws error otherwise
    authenticateUser : async (encodedBase64Credentials) => {
        // Remove unneeded prefacing data
        encodedBase64Credentials = encodedBase64Credentials.split("Basic").pop().trim();
        
        // Decode and seperate credentials
        let decodedCredentials = Buffer.from(encodedBase64Credentials, 'base64').toString('utf-8').split(":");
        if (decodedCredentials.length !== 2) {
            throw formatter.formatResponse('Unexpected decoded credentials!', 
                                           'Credentials should be formatted {userId}:{password} and then encoded in Base64',
                                           response.INVALID_REQUEST);
        }
        
        let userId = decodedCredentials[0];
        let password = decodedCredentials[1];

        // Confirm userId exists 
        await userService.getUser(userId)
        .then(data => {
            // Check that the passwords match
            if (password !== data.detail[0].dataValues.pwrd) {
                throw formatter.formatResponse('User password is incorrect!',
                                               'Confirm password and try again',
                                               response.INVALID_REQUEST);
            }
        }, () => {
            throw formatter.formatResponse('User with userId=' + userId + ' could not be found!',
                                           null, response.NOT_FOUND);
        });

        return userId;
    }
};
