const { Sequelize, DataTypes } = require('sequelize');
const Users = require('./userModel.js');

module.exports = (sequelize, DataTypes)=>{
    const Assignment = sequelize.define('assignment',{
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdBy:{
            type:DataTypes.UUID,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,

             validate: {
                min: 1,
                max: 10,
             }

        },
        num_of_attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {

                min:1,
                max:100,

            },
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: false
        },
        assignment_created: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        assignment_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
    },{
        timestamps: false,
    });

    return Assignment;
}
