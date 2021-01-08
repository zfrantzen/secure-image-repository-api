const response = require('../constants/response.constants.js');
const db = require('../config/db.config.js');
const User = db.users;

module.exports = {
    postUser : (req, res) => {
        User.create().then((data) => {
            res.json({msg: 'User Successfully Generated', userId: data.id})
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    },

    getAllUsers : (req, res) => {
        User.findAll().then(data => {
            res.json(data)
        }).catch(err => {
            res.status(response.GENERIC_SERVER_ERROR).json({msg: 'Error', detail: err});
        });
    }
};
