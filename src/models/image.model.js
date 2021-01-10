const sequelize = require('../config/db.config.js').sequelize;
const Sequelize = require('../config/db.config.js').Sequelize;
const User = require('./user.model.js');

var Image = sequelize.define('image', {
  name: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.STRING
  },
  isPrivate: {
    type: Sequelize.BOOLEAN
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
        model: User,
        key: "id"
    }
  },
  data: {
    type: Sequelize.BLOB('long')
  }
});

Image.belongsTo(User);

module.exports = Image;
