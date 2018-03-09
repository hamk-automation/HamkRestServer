'use strict'
const request = require('request')
const async = require('async')
var config = require('../../server/config.json');
var path = require('path');
var senderAddress = "konttigrafana@gmail.com"; //Replace this address with your actual address

module.exports = function(User) {
    User.afterRemote("create", function(context, user, next,cb) {
        User.getApp(function (err, app) {
          console.log(user.role)
          app.models.Role.findOne(
              { where : { name: user.role } },
              function(err, role) {
                  if (err) {
                      console.log(err)
                      next()
                      return
                  }
                  role.principals.create({
                      principalType: app.models.RoleMapping.USER,
                      principalId: user.id
                  },
                  function(err, principal) {
                      console.log(principal)
                        next()
                  })
              })
            })
          })
      User.afterRemote("create", function(context, user, next,cb) {
            User.getApp(function (err, app) {
            console.log('> user.afterRemote triggered');

               var options = {
                 type: 'email',
                 to: user.email,
                 from: 'noreply@loopback.com',
                 subject: 'Thanks for registering.',
                 template: path.resolve(__dirname, '../../server/views/verify.ejs'),
                 redirect: '/explorer/verified',
                 user: user
               };

               user.verify(options, function(err, response, next) {
                 if (err) return next(err);

                 console.log('> verification email sent:', response);

                 context.res.render('response', {
                   title: 'Signed up successfully',
                   content: 'Please check your email and click on the verification link before logging in.',
                   redirectTo: '/explorer/login',
                   redirectToLinkText: 'Log in'
                 })
      })
      })
    })
       User.afterRemote('patchOrCreate',function(ctx,user,next){
          User.getApp(function (err, app) {
              app.models.RoleMapping.findOne(
                  { where : { principalId: ctx.args.data.id } },
                  function(err, principal) {
                      if (err) {
                          console.log(err)
                          next()
                          return
                        }
                app.models.Role.findOne(
                    { where : { name: ctx.args.data.role } },
                    function(err, role) {
                        if (err) {
                          console.log(err)
                          next()
                          return
                        }
                app.models.RoleMapping.upsert({roleId:role.id, id:principal.id}
                  ,function(err, res){
                     next()
                     if (err) {
                        console.log(err)
                        next()
                        return
                        }

                    })
                })
            })
        })
    })

    User.afterRemote( "deleteById", function( ctx, user, next) {
      console.log(ctx, user)
      User.getApp(function (err, app) {
        app.models.RoleMapping.findOne(
            { where : { principalId: ctx.args.id } },
            function(err, principal) {
                if (err) {
                    console.log(err)
                    next()
                    return
                  }
                  console.log(principal.id)
        app.models.RoleMapping.destroyById(principal.id
        ,function(err, res){
           next()
           if (err) {
              console.log(err)
              next()
              return
              }
    })
})
})
})
/*
User.afterRemote('confirm', function(ctx ,user,next) {
  //console.log('ctx.methodString', ctx.methodString)
  User.getApp(function (err, app) {
  app.models.user.upsert({id:ctx.args.uid ,verificationToken:ctx.args.token}
    ,function(err, res){
       next()
       if (err) {
          console.log(err)
          next()
          return
          }
        })
})
})
*/
// Method to render
  User.afterRemote('prototype.verify', function(context, user, next) {
    context.res.render('response', {
      title: 'A Link to reverify your identity has been sent '+
        'to your email successfully',
      content: 'Please check your email and click on the verification link '+
        'before logging in',
      redirectTo: '/explorer/login',
      redirectToLinkText: 'Log in'
    });
  });

  User.on('resetPasswordRequest', function(info) {
    var url = 'http://iot.research.hamk.fi/explorer/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
        info.accessToken.id + '">here</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: senderAddress,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });

  User.afterRemote('changePassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password changed successfully',
      content: 'Please login again with new password',
      redirectTo: '/explorer/login',
      redirectToLinkText: 'Log in'
    });
  });

  //render UI page after password reset
  User.afterRemote('setPassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password reset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/explorer/login',
      redirectToLinkText: 'Log in'
    });
  });

  User.disableRemoteMethodByName('exists', true);
  User.disableRemoteMethodByName('replaceById', true);
  User.disableRemoteMethodByName('replaceById', true);
  User.disableRemoteMethodByName('createChangeStream', true);
  User.disableRemoteMethodByName('replaceOrCreate', true);
  User.disableRemoteMethodByName('updateAll', true);
  User.disableRemoteMethodByName('upsertWithWhere', true);
  User.disableRemoteMethodByName('findOne', true);

  User.disableRemoteMethodByName('prototype.__create__locations', true);
  User.disableRemoteMethodByName('prototype.patchAttributes', true);

  User.disableRemoteMethodByName('prototype.__get__locations', true);
  User.disableRemoteMethodByName('prototype.__count__locations', true);
  User.disableRemoteMethodByName('prototype.__get__user', true);
  User.disableRemoteMethodByName('prototype.__delete__locations', true);
  User.disableRemoteMethodByName('prototype.__destroyById__locations', true);
  User.disableRemoteMethodByName('prototype.__updateById__locations', true);
  User.disableRemoteMethodByName('prototype.__findById__locations', true);

  User.disableRemoteMethodByName('prototype.__get__buildings', true);
  User.disableRemoteMethodByName('prototype.__create__buildings', true);
  User.disableRemoteMethodByName('prototype.__delete__buildings', true);
  User.disableRemoteMethodByName('prototype.__findById__buildings', true);
  User.disableRemoteMethodByName('prototype.__updateById__buildings', true);
  User.disableRemoteMethodByName('prototype.__count__buildings', true);
  User.disableRemoteMethodByName('prototype.__destroyById__buildings', true);

  User.disableRemoteMethodByName('prototype.__get__sensors', true);
  User.disableRemoteMethodByName('prototype.__create__sensors', true);
  User.disableRemoteMethodByName('prototype.__delete__sensors', true);
  User.disableRemoteMethodByName('prototype.__findById__sensors', true);
  User.disableRemoteMethodByName('prototype.__updateById__sensors', true);
  User.disableRemoteMethodByName('prototype.__count__sensors', true);
  User.disableRemoteMethodByName('prototype.__destroyById__sensors', true);

  User.disableRemoteMethodByName('prototype.__get__systems', true);
  User.disableRemoteMethodByName('prototype.__create__systems', true);
  User.disableRemoteMethodByName('prototype.__findById__systems', true);
  User.disableRemoteMethodByName('prototype.__delete__systems', true);
  User.disableRemoteMethodByName('prototype.__count__systems', true);
  User.disableRemoteMethodByName('prototype.__updateById__systems', true);
  User.disableRemoteMethodByName('prototype.__destroyById__systems', true);

  User.disableRemoteMethodByName('prototype.__findById__accessTokens', true);
  User.disableRemoteMethodByName('prototype.__updateById__accessTokens', true);
  User.disableRemoteMethodByName('prototype.__destroyById__accessTokens', true);
/*
  User.beforeRemote('**', function(ctx ,user,next) {
    console.log('ctx.methodString', ctx.methodString)
  })
*/
}
