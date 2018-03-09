'use strict'

module.exports = function(System) {
    System.beforeRemote('create', function(context, user, next) {
        context.args.data.userId = context.req.accessToken.userId
        next()
    })

    System.disableRemoteMethodByName('exists', true);
    System.disableRemoteMethodByName('replaceById', true);
    System.disableRemoteMethodByName('replaceById', true);
    System.disableRemoteMethodByName('createChangeStream', true);
    System.disableRemoteMethodByName('replaceOrCreate', true);
    System.disableRemoteMethodByName('updateAll', true);
    System.disableRemoteMethodByName('upsertWithWhere', true);
    System.disableRemoteMethodByName('findOne', true);
    System.disableRemoteMethodByName('prototype.__create__locations', true);
    System.disableRemoteMethodByName('prototype.patchAttributes', true);
    System.disableRemoteMethodByName('prototype.__get__locations', true);
    System.disableRemoteMethodByName('prototype.__count__locations', true);
    System.disableRemoteMethodByName('prototype.__get__user', true);
    System.disableRemoteMethodByName('prototype.__delete__locations', true);
    System.disableRemoteMethodByName('prototype.__destroyById__locations', true);
    System.disableRemoteMethodByName('prototype.__updateById__locations', true);
    System.disableRemoteMethodByName('prototype.__findById__locations', true);
    System.disableRemoteMethodByName('prototype.__delete__sensors', true);
    System.disableRemoteMethodByName('prototype.__findById__sensors', true);
    System.disableRemoteMethodByName('prototype.__create__sensors', true);
    System.disableRemoteMethodByName('prototype.__get__sensors', true);
    System.disableRemoteMethodByName('prototype.__updateById__sensors', true);
    System.disableRemoteMethodByName('prototype.__destroyById__sensors', true);
    System.disableRemoteMethodByName('prototype.__count__sensors', true);

/*
    System.beforeRemote('**', function(ctx ,user,next) {
      console.log('ctx.methodString', ctx.methodString)
    })
*/
}
