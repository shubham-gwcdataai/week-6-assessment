const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Todo = sequelize.define('Todo', {
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { len: [1, 255] },
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'todos',
  timestamps: true,
});

module.exports = Todo;
