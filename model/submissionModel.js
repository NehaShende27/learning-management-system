const { Sequelize, DataTypes } = require('sequelize');
const Users = require('./userModel.js');
const Assignment = require('./assignmentModel.js');

module.exports = (sequelize, DataTypes)=>{
    const Submission = sequelize.define('submission',{
        submission_id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        assignment_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            
        },
        submitted_by:{
            type:DataTypes.UUID,
            allowNull: false
        },
        submission_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        submission_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        submission_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        attempt_no:{
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },{
        timestamps: false,
    });

    return Submission;
}
