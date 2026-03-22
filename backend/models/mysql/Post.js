
const { DataTypes } = require('sequelize');
const { sequelize }  = require('../../config/mysql');

const Post = sequelize.define('Post', {

  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },

  title: {
    type:      DataTypes.STRING(200),
    allowNull: false,
    validate:  { len: [1, 200] },
  },

  content: {
    type:      DataTypes.TEXT,
    allowNull: false,
  },

  // Foreign key — which user created this post
  userId: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName:  'posts',
  timestamps: true,
});

module.exports = Post;
