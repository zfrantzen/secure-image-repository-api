const Sequelize = require('sequelize');

const db = {};
module.exports = db;
 
db.Sequelize = Sequelize;
db.sequelize = require('./db.connection');
 
db.images = require('../models/image.model.js');
db.users = require('../models/user.model.js');
