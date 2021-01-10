const sequelize = require('../config/db.config.js').sequelize;
const Sequelize = require('../config/db.config.js').Sequelize;

var User = sequelize.define('user', {
    // Note: The password field should not be stored in plaintext if we were to use this in a
    //       production enviroment
    pwrd: {
        type: Sequelize.STRING
    }
});

module.exports = User;
