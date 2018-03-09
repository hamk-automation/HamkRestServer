'use strict'

module.exports = function(Location) {
    Location.beforeRemote('create', function(context, user, next) {
        context.args.data.userId = context.req.accessToken.userId
        next()
    })

    Location.disableRemoteMethodByName('exists', true);
    Location.disableRemoteMethodByName('replaceById', true);
    Location.disableRemoteMethodByName('replaceById', true);
    Location.disableRemoteMethodByName('createChangeStream', true);
    Location.disableRemoteMethodByName('replaceOrCreate', true);
    Location.disableRemoteMethodByName('updateAll', true);
    Location.disableRemoteMethodByName('upsertWithWhere', true);
    Location.disableRemoteMethodByName('findOne', true);
    Location.disableRemoteMethodByName('prototype.__create__locations', true);
    Location.disableRemoteMethodByName('prototype.patchAttributes', true);
    Location.disableRemoteMethodByName('prototype.__get__locations', true);
    Location.disableRemoteMethodByName('prototype.__count__locations', true);
    Location.disableRemoteMethodByName('prototype.__get__user', true);
    Location.disableRemoteMethodByName('prototype.__delete__locations', true);
    Location.disableRemoteMethodByName('prototype.__destroyById__locations', true);
    Location.disableRemoteMethodByName('prototype.__updateById__locations', true);
    Location.disableRemoteMethodByName('prototype.__findById__locations', true);
    Location.disableRemoteMethodByName('prototype.__get__building', true);
    Location.disableRemoteMethodByName('rototype.__get__sensors', true);
    Location.disableRemoteMethodByName('prototype.__create__sensors', true);
    Location.disableRemoteMethodByName('prototype.__delete__sensors', true);
    Location.disableRemoteMethodByName('prototype.__findById__sensors', true);
    Location.disableRemoteMethodByName('prototype.__updateById__sensors', true);
    Location.disableRemoteMethodByName('prototype.__count__sensors', true);
    Location.disableRemoteMethodByName('prototype.__destroyById__sensors', true);
    Location.disableRemoteMethodByName('prototype.__get__sensors', true);

/*
    Location.beforeRemote('**', function(ctx ,user,next) {
      console.log('ctx.methodString', ctx.methodString)
    })
*/
}
