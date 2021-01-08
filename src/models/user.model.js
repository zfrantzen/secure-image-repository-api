const sequelize = require('../config/db.connection.js').sequelize;
var Sequelize = require('../config/db.connection.js').Sequelize;

var User = sequelize.define('user', {
    // Note: password security strength can be improved by encrypting this field
    //       storing it
    pwrd: {
        type: Sequelize.STRING
    }
});

module.exports = User;
