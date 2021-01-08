var crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const IV = '1234567890123456';      // Note: if used in production, we should not have fixed IV

const userService = require('./user.service.js');

function generateCharSum(text) {
    let sum = 0;

    for (let i = 0; i < text.length; i++) {
        sum += text.charCodeAt(i);
    }

    return sum;
};

async function generateUserKey(userId) {
    let sum;
    
    await userService.getUser(userId)
        .then(data => {
            // Generate the user's key by adding the int of their password and int of their int creation date
            let password = generateCharSum(data.detail[0].pwrd);
            let datetime = Date.parse(data.detail[0]['createdAt']);
            sum = password + datetime;
        }, () => {
            throw ('User with userId=' + userId + ' could not be found!');
        });
    
    let key = Array.from(sum.toString()).map(Number);

    if (key.length > 32) {
        key = key.slice(0, 32);
    }
    else if (key.length < 32) {
        for (let i = key.length; i < 32; i++) {
            key.push(9);
        }
    }

    return Buffer.from(key);
};

module.exports = {
    async encryptImage(userId, imageByteStream) {
        let key = await generateUserKey(userId);
        var cipher = crypto.createCipheriv(algorithm, key, IV);
        return Buffer.concat([cipher.update(imageByteStream), cipher.final()]);
    },

    async decrpytImage(userId, imageByteStream) {
        let key = await generateUserKey(userId);
        var decipher = crypto.createDecipheriv(algorithm, key, IV)
        return Buffer.concat([decipher.update(imageByteStream) , decipher.final()]);
    }
};
