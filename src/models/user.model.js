const sequelize = require('../config/db.connection.js').sequelize;

var User = sequelize.define('user');

module.exports = User;
