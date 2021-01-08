const db = {};
 
db.Sequelize = require('./db.connection').Sequelize;
db.sequelize = require('./db.connection').sequelize;
 
db.images = require('../models/image.model.js');
db.users = require('../models/user.model.js');
 
module.exports = db;
