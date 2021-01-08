module.exports = {

    // Returns userId upon success, throws error otherwise
    authenticateUser : (encodedBase64Credentials) => {
        // Remove unneeded prefacing data
        encodedBase64Credentials = encodedBase64Credentials.split("Basic").pop().trim();
        
        // Decode and seperate credentials
        let decodedCredentials = Buffer.from(encodedBase64Credentials, 'base64').toString('utf-8').split(":");
        if (decodedCredentials.length !== 2) {
            throw ('Unexpected decoded credentials! Credentials should be formatted {userId}:{password} and then encoded in Base64');
        }
        
        let userId = decodedCredentials[0];
        let password = decodedCredentials[1];

        // Check and compare with database
        // TODO

        return userId;
    }
};