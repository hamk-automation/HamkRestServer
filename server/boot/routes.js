// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-example-user-management
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var dsConfig = require('../datasources.json');
var path = require('path');

module.exports = function(app) {
  var User = app.models.user

  //login page
  app.get('/explorer/login', function(req, res) {
    var credentials = app.models.user;
    res.render('login', {
      email: credentials.user,
      username: credentials.user,
      password: credentials.pass
    })
  })

  //verified
  app.get('/explorer/verified', function(req, res) {
    res.render('verified')
  })


  //log a user in
  app.post('/explorer/login', function(req, res) {
    User.login({
      email: req.body.email,
      password: req.body.password,
    }, 'user', function(err, token) {
      if (err) {
        if(err.details && err.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED'){
          res.render('reponseToTriggerEmail', {
            title: 'Login failed',
            content: err,
            redirectToEmail: '/explorer/api/v1/users/'+ err.details.userId + '/verify',
            redirectTo: '/explorer/login',
            redirectToLinkText: 'Click here',
            userId: err.details.userId
          });
        } else {
          res.render('response', {
            title: 'Login failed. Wrong username or password',
            content: err,
            redirectTo: '/explorer/login',
            redirectToLinkText: 'Please login again',
          })
        }
        return
      }
      res.render('home', {
        email: req.body.email,
        accessToken: token.id,
        redirectUrl: '/explorer/api/v1/users/change-password?access_token=' + token.id
      })
    })
  })

  //log a user out
  app.get('/explorer/logout', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    User.logout(req.accessToken.id, function(err) {
      if (err) return next(err);
      res.redirect('/explorer/login')
    })
  })

  //send an email with instructions to reset an existing user's password
  app.post('/explorer/request-password-reset', function(req, res, next) {
    User.resetPassword({
      email: req.body.email
    }, function(err) {
      if (err) return res.status(401).send(err);

      res.render('response', {
        title: 'Password reset requested',
        content: 'Check your email for further instructions',
        redirectTo: '/explorer/login',
        redirectToLinkText: 'Log in'
      })
    })
  })

  //show password reset form
  app.get('/explorer/reset-password', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    res.render('password-reset', {
      redirectUrl: '/explorer/api/v1/users/reset-password?access_token='+
        req.accessToken.id
    })
  })
}
