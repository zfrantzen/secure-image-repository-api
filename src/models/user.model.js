const sequelize = require('../config/db.connection.js').sequelize;
var Sequelize = require('../config/db.connection.js').Sequelize;

var User = sequelize.define('user', {
    pwrd: {
        type: Sequelize.STRING
    }
});

module.exports = User;
