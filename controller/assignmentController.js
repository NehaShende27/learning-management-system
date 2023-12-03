const db = require('../model')
const controllerUser = require('./userController.js');
const lg = require('../logger.js');
const stat = require('../statsd.js');

//const User = db.users
const Assignment = db.assignments
const Submission = db.submissions

require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' }); 

const sns = new AWS.SNS();

const addAssignment = async(req, res)=>{
    stat.increment('assignment.create.count');
    const authUser = req.headers.authorization;

    if (!authUser) {
        lg.warn('User is not authorized!');

        let error = new Error('You are not authorized!');
    
        res.setHeader('WWW-Authenticate', 'Basic');
    
        res.status(401).send();
    

    }else{
        lg.info('Authorized user:', authUser);
        //console.log(authUser);
    
        const auth_check = new Buffer.from(authUser.split(' ')[1],

            'base64').toString().split(':');

        const userx = auth_check[0];

        const pass = auth_check[1];

        // console.log(userx);
        // console.log(pass);
        //lg.info('User:', userx);
        //lg.info('Password:', pass);
        //console.log(user);

        const currUser = await controllerUser.getUser(userx);

        // Validate 'name' and 'createdBy' types
        if (typeof req.body.name !== 'string') {
        res.status(400).json({ error: 'Invalid type for name. It should be a string.' });
        } else if (typeof currUser !== 'string') {
        res.status(400).json({ error: 'Invalid type for createdBy. It should be a string.' });
        }else{

        let info ={
            //id: req.body.id,
            name:req.body.name,
            createdBy:currUser,
            points:req.body.points,
            num_of_attempts:req.body.num_of_attempts,
            deadline:req.body.deadline,
            assignment_created:req.body.assignment_created,
            assignment_updated:req.body.assignment_updated
        }


        try{
            if(req.body.id){
                throw new Error("Explicit 'id' field not allowed.")
            }

            // Ensure the request matches the expected schema
            const expectedParams = [
                'name',
                'createdBy',
                'points', 
                'num_of_attempts',
                'deadline',
                'assignment_created',
                'assignment_updated'
            ];

            for (const key of Object.keys(req.body)) {
                if (!expectedParams.includes(key)) {
                    throw new Error(`Invalid field: ${key}`);
                }
            }
            if (new Date(info.deadline) <= new Date()) {
                res.status(400).json({ error: 'Deadline must be a future date.' });
            }else{
                const assignment = await Assignment.create(info)
                await db.sequelize.sync();
                res.status(201).send(assignment);
                console.log(assignment)
            }
        }catch(error){
            
            if (error.message === "Explicit 'id' field not allowed."){
                    res.status(400).json({ error: error.message });
            }else if (error.message.startsWith('Invalid field: ')) {
                res.status(400).json({ error: error.message });
            }else if(error.name == 'SequelizeValidationError'){ 
                res.status(400).json({ error: error.errors[0].message });
            }else{
                //console.error(error);
                lg.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }   
}
}

const getAllAssignments = async(req, res)=>{
    stat.increment('assignment.getall.count');
    const authUser = req.headers.authorization;
    if (!authUser) {

        let error = new Error('You are not authorized!');
        lg.error('You are not authorized!');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).send();
    }else{
        const loggedUser = await controllerUser.loginAuthentication(req, res);
        lg.info(loggedUser)
        //console.log(loggedUser);
        if(loggedUser){
            let assignments = await Assignment.findAll({});
            await db.sequelize.sync();
            res.status(200).send(assignments);
        }
      }

}

const getSingleAssignment = async(req, res)=>{
    stat.increment('assignment.getunique.count');
    const authUser = req.headers.authorization;
    if (!authUser) {
        let error = new Error('You are not authenticated!');
        lg.error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).send();
    }else{
        const loggedUser = await controllerUser.loginAuthentication(req, res);
        lg.info(loggedUser)
        //console.log(loggedUser);
        if(loggedUser){
            let id = req.params.id
            let assignment = await Assignment.findOne({where: {id:id}})

            if(assignment != null){
                await db.sequelize.sync();
                lg.info('Found the assignment');
                res.status(200).send(assignment);
            }else{
                lg.warn('Assignment not found');
                res.status(404).send("Not found");
            }
            

        }
      }
    
}

const updateAssignment = async(req, res)=>{
    stat.increment('assignment.update.count');
    const authUser = req.headers.authorization;

    let changedItems ={
        name: req.body.name,
        points: req.body.points,
        num_of_attempts: req.body.num_of_attempts,
        deadline: req.body.deadline
    }
    if (!authUser) {

        let error = new Error('You are not authenticated!');
        //lg.error(error);
        res.setHeader('WWW-Authenticate', 'Basic');
    
        res.status(401).send();
    
      }else{
        const loggedUser = await controllerUser.loginAuthentication(req, res);
        lg.info(loggedUser);
        //console.log(loggedUser);
        if(loggedUser){

            if(Object.keys(req.body).length != 0){
                const auth_check = new Buffer.from(authUser.split(' ')[1],
                 'base64').toString().split(':');

            const userx = auth_check[0];
            const logged_user = await controllerUser.getUser(userx);
            const assID = await Assignment.findOne({where: {"id" : req.params.id}});
            if(assID != null){

                if (logged_user == assID.createdBy){
                    const updated = {
      
                      name : req.body.name,
      
                      points: req.body.points,
      
                      num_of_attempts : req.body.num_of_attempts,
      
                      deadline : req.body.deadline,
                      // Set updated timestamp to now
                      assignment_updated: new Date()
                    };
                    // Save updated assignment to database
                    Assignment.update(updated, {
                      where: {
                        id: req.params.id
                      }
                    }).then(result => {
                        lg.info('Assignment updated');
                      res.status(204).send('Assignment updated');
                    }).catch(err => {
                        lg.error('bad request');
                      res.status(400).send('Bad request')
                  });
            }else{ 
                    lg.error('Forbidden');
                    res.status(403).send("Action forbidden, cannot update the assignment");

            }
        }
            else{
                lg.error('Not found');
                res.status(404).send("Not found");
              }
            }
          }  
        }

}

const deleteAssignment = async(req, res)=>{
    stat.increment('assignment.delete.count');
    let id = req.params.id
    const authUser = req.headers.authorization;
    if (!authUser) {
        
        let error = new Error('You are not authenticated!');
        lg.error(error);
        res.setHeader('WWW-Authenticate', 'Basic');
    
        res.status(401).send();
    
    }else{
        const loggedUser = await controllerUser.loginAuthentication(req, res);
        lg.error(loggedUser);
        //console.log(loggedUser);
        if(loggedUser){            
                const auth_check = new Buffer.from(authUser.split(' ')[1],
                 'base64').toString().split(':');

                const userx = auth_check[0];
                const logged_user = await controllerUser.getUser(userx);
                const assID = await Assignment.findOne({where: {"id" : req.params.id}});
                
                let submissionAttempts = await Submission.count({
                    where: {
                        assignment_id: req.params.id,
                    },
                });
                console.log("sub att in del",submissionAttempts);
                // if(submissionAttempts >0){
                //     res.status(400).send("Cannot delete as submissions have been posted ffor this assignment.");
                // }else 
                if(assID != null){
                   
                    if (logged_user == assID.createdBy){
                        console.log('logged in user is',logged_user);
                        let id = req.params.id

                        console.log("assignment id is=",id)
                        console.log("submission attempts in delete",submissionAttempts)

                        if(submissionAttempts==0){
                            await Assignment.destroy({where: {id:id}});
                            await db.sequelize.sync();
                            res.status(204).send('Assignment is deleted!');
                            lg.info('Assignment deleted');
                        }else{
                            res.status(400).send("Cannot delete as submissions have been posted for this assignment.");
                        }
                       
                    
                    }else{
                        res.status(401).send("User is not authorized to delete this assignment");

                    }
                }else{
                    res.status(405).send("Delete unsuccessful");
                }
        }
    }
}  


const submitAssignment = async (req, res) => {
    stat.increment('assignment.submit.count');
    const authUser = req.headers.authorization;

    if (!authUser) {
        lg.warn('User is not authorized!');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).send();
    } else {
        const auth_check = new Buffer.from(authUser.split(' ')[1], 'base64').toString().split(':');
        const userx = auth_check[0];
        const pass = auth_check[1];

        const currUser = await controllerUser.getUser(userx);

        try {
            const assignmentId = req.params.id;
            const assignment = await Assignment.findOne({ where: { id: assignmentId } });
            
            if (!assignment) {
                res.status(404).json({ error: 'Assignment not found' });
            } else {
                // Check if the submission deadline has passed
                if (new Date(assignment.deadline) < new Date()) {
                    const deadline_rejection = {
                        Email : userx,
                        assignment_id: assignment.name,
                        gitHubReopUrl : req.body.submission_url,
                        rejectionReason : "Can't Submit after deadline"
                    }
     
                    const snsDeadlineMessage = {
                        Message: JSON.stringify(deadline_rejection),
                        TopicArn: process.env.SNS_TOPIC_ARN,
                    }
     
                    sns.publish(snsDeadlineMessage, (err, data) => {
                        if (err) {
                            lg.error(`SNS Publish Error: ${err}`);
                        } else {
                            lg.info('SNS message published successfully:', data.MessageId);
                        }
                    });
     
                    res.status(400).json({ error: 'Submission deadline has passed. Cannot submit.' });
                } else {
                    const expectedParams = [
                        'submission_url'
                    ];
        
                    for (const key of Object.keys(req.body)) {
                        if (!expectedParams.includes(key)) {
                            throw new Error(`Invalid field: ${key}`);
                        }
                    }
                    // Check if the user has exceeded the maximum number of attempts
                    let submissionAttempts = await Submission.count({
                        where: {
                            assignment_id: assignmentId,
                            submitted_by: currUser,
                        },
                    });
                    console.log('submission attempts=',submissionAttempts);
                    console.log('num of attempts allowed=', assignment.num_of_attempts);
                        if (submissionAttempts >= assignment.num_of_attempts) {
                            const rejection = {
                                Email : userx,
                                assignment_id: assignment.name,
                                gitHubReopUrl : req.body.submission_url,
                                rejectionReason : "Max attempts reached"
                            }
             
                            const snsFailMessage = {
                                Message: JSON.stringify(rejection),
                                TopicArn: process.env.SNS_TOPIC_ARN,
                            }
             
                            sns.publish(snsFailMessage, (err, data) => {
                                if (err) {
                                    lg.error(`SNS Publish Error: ${err}`);
                                } else {
                                    lg.info('SNS message published successfully:', data.MessageId);
                                }
                            });
                            res.status(400).json({ error: 'Exceeded maximum number of submission attempts.' });
                        } else {
                            const attemptNo = submissionAttempts + 1;

                            let info ={
                                //submission_id
                                assignment_id: assignmentId,
                                submitted_by: currUser,
                                submission_url: req.body.submission_url,
                                submission_date:assignment.deadline,
                                submission_updated: req.body.submission_updated,
                                attempt_no: attemptNo
                            }

                            const submission_Info = {
                                Email : userx,
                                assignment_id: req.params.id,
                                gitHubReopUrl : req.body.submission_url
                            }
                           
                            try{
                                const snsMessage = {
                                    Message: JSON.stringify(submission_Info),
                                    TopicArn: process.env.SNS_TOPIC_ARN,
                                }
                                lg.info(snsMessage);
                   
                       
                                const submission = await Submission.create(info);

                                
                                try{
                                    sns.publish(snsMessage, (err, data) => {
                                        if (err) {
                                            lg.error(`SNS Publish Error: ${err}`);
                                        } else {
                                            lg.info('SNS message published successfully:', data);
                                        }
                                    });
                               
                               
                                    //logger.info(`${user1} submitted ${submittedAssignment.submission_url} for assignment ${req.params.id}`)
             
                                    console.log(submission)
                                    res.status(201).json(submission);
                                }catch(error){
                                    lg.error(error)
                                }
                            }catch(error){
                                lg.error(error)
                            }
    
                        }
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = {
    addAssignment,
    getAllAssignments,
    getSingleAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment
}