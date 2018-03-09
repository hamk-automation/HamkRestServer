# HamkRestServer
Rest API


Version 1.0.0

Install node-modules:
```
npm install
```
After installing node-modules changes for node-modules:

From node-modules change loopback/common/models/user.js:

    //this line

    // Make sure emailVerified is not set by creation
    UserModel.beforeRemote('create', function(ctx, user, next) {
      var body = ctx.req.body;
      if (body && body.emailVerified) {
        body.emailVerified = false;
      }
      next();
    });
    
    //to this, so every new user is guest
    
    // Make sure emailVerified is not set by creation
    UserModel.beforeRemote('create', function(ctx, user, next) {
      var body = ctx.req.body;
      if (body && body.emailVerified) {
        body.emailVerified = false;
      }
      if (body && body.role) {
        body.role= 'guest';
      }
      next();
    });

User-managment is done by MySQL-database and loopback MySQL module. 

Data-schema/models are specified by MySQL but measurements/data is read from InfluxDB.
