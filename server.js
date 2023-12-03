const express = require ('express');
const cors = require('cors');
//const routes = require('./routes/assignmentRoutes.js');
const app = express();
const csvtoMysql = require('./controller/userController.js');
const config = require('./config/testConfig.js')

if (process.env.NODE_ENV === 'test') {
    const testConfig = require('./config/testConfig'); // Load the test configuration
    // Use the test configuration for the test environment
    config.DB = testConfig.DB;
    config.USER = testConfig.USER;
    config.PASSWORD = testConfig.PASSWORD;
    config.HOST = testConfig.HOST;
    config.DIALECT = testConfig.DIALECT;
  }
var corOptions = {
    origin: 'https://localhost:8081'
}

//middlewares
app.use(cors(corOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//router for assignments
const router1 = require('./routes/assignmentRoutes.js');
app.use('/v1',router1);

//router for healthz
// const router2 = require('./routes/userRoutes.js');
// app.use('/healthz',router2);


//app.use(routes);

//call csv tomysql func
//csvtoMysql.CSVtoMySQL

//test api
// app.get('/',(req,res)=>{
//     //res.status(200).send();
//     res.json({message: 'hello'})
// });

const PORT = 8080;

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
});


module.exports= app;