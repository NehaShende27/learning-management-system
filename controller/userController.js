const db = require('../model/index.js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const csv = require('csv-parser');
const User = db.users;
const lg = require('../logger.js');


const csvFilePath = './users.csv';

const data = [];

const checkFunc = async(email)=>{
    try{
        const user = await User.findOne({
            where:{
                email: email
            }
        });
        return true;
    }catch(error){
        lg.error('Error in checkFunc:', error);
        //console.log(error);
        //return false;
    }
};
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', async(row)=>{
            try{
                const pwd = bcrypt.hashSync(row.password, 10);
                const existingUser = await checkFunc(row.email);

                //if(existingUser){
                    const objUser = {
                        first_name: row.first_name,
                        last_name: row.last_name,
                        password: pwd,
                        email: row.email
                    };
                    data.push(objUser);
                    //console.log(data);
                //}
                //console.log('Processed user');
                lg.info('Processed user:', objUser);
            }catch(error){
                //console.log('Error with data processing',error);
                lg.error('Error with data processing:', error);
            }
        })
       .on('end', async()=>{
        try{
            await db.sequelize.sync();
            await User.bulkCreate(data,{ignoreDuplicates: true});
            //db.connect();
            console.log(User);
            console.log('Bulk successful');
            lg.info('Bulk successful');
        }catch(error){
            //console.log('Error while insering data in bulk');
            lg.error('Error while inserting data in bulk:', error);
        }
       })
    
//}

const authenticateUser = async(req, res)=>{

    const head = req.headers.authorization;
    console.log(req.headers);

    if(!head){
        let err = new Error('User is not authorized');
        lg.warn('User is not authorized');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).send();
    }

    const auth = new Buffer.from(head.split(' ')[1], 'base64').toString().split(':');

    const user = auth[0];
    const pwd = auth[1];

    const dummyUser = await User.findOne({where:{"email":user}});
    if(!dummyUser){
        lg.error('User not found');
        return res.status(400).send('User not found');
    }
    const result = bcrypt.compareSync(pwd, dummyUser.password);

    if(result){
        lg.info('Authentication Successful');
        return res.send('Authentication Successful');
    }
    lg.warn('Authentication failed');
    res.status(401).send('Authentication failed');
}

const getUser = async (userx) => {
    const current_user= await User.findOne({where: {"email" : userx}});
    lg.info('Fetched user:', current_user.id);
    //console.log(current_user.id)

    return current_user.id;
}

   
const loginAuthentication = async (req, res) => {

    const result = await db.dbConnectionCheck();

    if(result.status === 200) {
    const auth = req.headers.authorization; 
    const auth_check = new Buffer.from(auth.split(' ')[1],
        'base64').toString().split(':');

    const user = auth_check[0];
    const pwd = auth_check[1];
    //console.log(user);
    lg.info('User:', user);
    const user1= await User.findOne({where: {"email" : user}});

   

    if (user1 == null) {
        lg.warn('Unauthorized');
        res.status(401).send("Unathorized")
        return false;
    }
    const result = bcrypt.compareSync(pwd, user1.password);
  if (result) {
    lg.info('Authentication Successful');
    return true;

  }else{
    lg.warn('Unauthorized');
    res.status(401).send("Unathorized")
    return false;
  }

} else {
    lg.error('Service Unavailable');
    res.status(503).send();
}
}
module.exports= {
    authenticateUser,
    getUser,
    loginAuthentication
    //CSVtoMySQL
};
