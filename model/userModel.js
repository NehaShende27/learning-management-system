const {Sequelize, DataTypes}  = require('sequelize');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');

// const Sequelize = require('sequelize');

// const sequelize = new Sequelize({
//   dialect: 'mysql',
//   host: 'localhost',
//   username: 'root',
//   password: 'neha270100',
//   database: 'database2',
// });

module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define('user',{
        id: {
            type: DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
          },
          account_created: {
            type: DataTypes.DATE,
            //defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            allowNull: false,
            defaultValue: DataTypes.NOW,
            // timestamps:false
          },
          account_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            // timestamps:false
            //defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)')
          }
    });
    

    // module.exports= {
    //   User,
    //   CSVtoMySQL
    // };
    console.log("this is user in  userModel")
    console.log(User)
    return User;
 }