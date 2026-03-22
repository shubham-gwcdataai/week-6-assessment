
const { DataTypes } = require('sequelize');
const { sequelize }  = require('../../config/mysql');

const User = sequelize.define('User', {

  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },

  username: {
    type:      DataTypes.STRING(50),
    allowNull: false,
    unique:    true,
    validate:  { len: [3, 50] },
  },

  email: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    true,
    validate:  { isEmail: true },
  },

  password: {
    type:      DataTypes.STRING(255), // stores bcrypt hash
    allowNull: false,
  },

  // RBAC — Role-Based Access Control
  // 'user'  → can only read their own data
  // 'admin' → can manage all users
  role: {
    type:         DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull:    false,
  },

  isActive: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  tableName:  'users',
  timestamps: true, // adds createdAt & updatedAt
});

module.exports = User;
