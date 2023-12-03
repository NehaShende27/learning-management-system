const assignmentController = require('../controller/assignmentController.js');
const userController = require('../controller/userController.js');
const healthController = require('../controller/healthController.js');
const router = require('express').Router();

const db = require('../model');

router.post('/assignments', assignmentController.addAssignment);

router.get('/assignments', assignmentController.getAllAssignments);

router.get('/assignments/:id', assignmentController.getSingleAssignment);

router.put('/assignments/:id', assignmentController.updateAssignment);

router.delete('/assignments/:id', assignmentController.deleteAssignment);

router.post('/assignments/:id/submission', assignmentController.submitAssignment);

//router.post('/auth', userController.authenticateUser);

//router.get('/healthz', healthController.health);



router.all('/healthz', healthController.checkAll);
  
  // router.route('/healthz')
  //   .all(healthController.checkAll)
  //   .all(healthController.handleInvalidMethods) // Apply middleware to handle invalid methods
  //   .get(db.dbConnectionCheck); // Handle GET requests


module.exports = router; 