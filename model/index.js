const dbConfig = require('../config/dbConfig.js');
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,{
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorsAliases: false,

        pool:{
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        }
    }

)

const connect = async() => {
    try {
      await sequelize.authenticate();

      db.sequelize.sync({ force: false})
  
    .then(() => {
  
      console.log('yes re-sync done!')
  
  })
  
      return true;
  
    } catch(err) {
  
      return false;
  
    }
  
  }
  
  const dbConnectionCheck = async () => {

    try {
  
      await sequelize.authenticate();
      return {status: 200};
    } catch(err) {
      return {status: 503};
    }
  
  }
  
   
// sequelize.authenticate()
// .then(()=>{
//     console.log('connected..')
// })
// .catch(err=>{
//     console.log('Error'+err)
// })

const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.connect = connect;
db.dbConnectionCheck = dbConnectionCheck;


db.users = require('./userModel.js')(sequelize, DataTypes)
db.assignments = require('./assignmentModel.js')(sequelize, DataTypes)
db.submissions = require('./submissionModel.js')(sequelize, DataTypes)
console.log('this is db');
// console.log(db);
// db.sequelize.sync({force: false})
// .then(()=>{
//     console.log('yes re-sync done')
// })


module.exports = db
