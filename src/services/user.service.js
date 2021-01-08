const response = require('../constants/response.constants.js');
const formatter = require('../utils/formatter.js');

const db = require('../config/db.config.js');
const User = db.users;

module.exports = {
    postUser(password) {
        return new Promise((resolve, reject) => {
            User.create({
                pwrd: password
            }).then((data) => {
                resolve(formatter.formatResponse('User successfully generated', {
                    userId: data.id, 
                    password: data.pwrd
                }, response.SUCCESS));
            }).catch(err => {
                reject(response.GENERIC_SERVER_ERROR).json(formatter.formatResponse('Query error', err));
            });
        });
    },

    getUser(userId) {
        return new Promise((resolve, reject) => {
            User.findAll({
                where: {
                    id: userId
                }
            }).then(data => {
                if (data.length === 0) {
                    reject(formatter.formatResponse('No user with userId=' + userId + ' was found', null, response.NOT_FOUND));
                }

                resolve(formatter.formatResponse('User found', data, response.SUCCESS));
            }).catch(err => {
                reject(response.GENERIC_SERVER_ERROR).json(formatter.formatResponse('Query error', err));
            });
        });
    },

    getAllUsers() {
        return new Promise((resolve, reject) => {
            User.findAll().then(data => {
                resolve(formatter.formatResponse('All users', data, response.SUCCESS));
            }).catch(err => {
                reject(response.GENERIC_SERVER_ERROR).json(formatter.formatResponse('Query error', err));
            });
        });
    }
}
