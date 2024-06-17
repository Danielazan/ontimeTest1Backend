const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class User extends Model {};

User.init({
  FristName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  MiddleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  LastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  PhoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Gender: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  UserName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Nin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'user',
  timestamps: true
})

module.exports = User;