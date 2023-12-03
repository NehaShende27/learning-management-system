# learning-management-system

in this project, following functionalities are implemented-

1. create user, assignment and submission tables using Sequelize ORM
2. authenticate users that are imported from users.csv using JWT and basic auth
3. check health of the application using the healthz endpoint
4. perform CRUD operations for assignments with validations such as only the user creating an assignment should be allowed to delete it, the deadline must be future-dated, thepoints should be between 1-100, number of attempts should be between 1-10
5. validate following API requirements as well- http response should contain only specific information, url should be checked, only specific methods should be allowed
6. submit assignments with respect to number of attempts per user, apply validations to number of attempts, date of submission, and delete an assigment only if it doesn't have any submissions posted for it
7. perform integration tests using mocha and chai frameworks


# Instructions

1. add .env file
2. run npm install
3. run node start
