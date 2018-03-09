'use strict'

module.exports = function(Building) {
    Building.beforeRemote('create', function(context, user, next) {
      context.args.data.userId = context.req.accessToken.userId
      next()
    })
    Building.disableRemoteMethodByName('exists', true);
    Building.disableRemoteMethodByName('replaceById', true);
    Building.disableRemoteMethodByName('replaceById', true);
    Building.disableRemoteMethodByName('createChangeStream', true);
    Building.disableRemoteMethodByName('replaceOrCreate', true);
    Building.disableRemoteMethodByName('updateAll', true);
    Building.disableRemoteMethodByName('upsertWithWhere', true);
    Building.disableRemoteMethodByName('findOne', true);
    Building.disableRemoteMethodByName('prototype.__create__locations', true);
    Building.disableRemoteMethodByName('prototype.patchAttributes', true);
    Building.disableRemoteMethodByName('prototype.__get__locations', true);
    Building.disableRemoteMethodByName('prototype.__count__locations', true);
    Building.disableRemoteMethodByName('prototype.__get__user', true);
    Building.disableRemoteMethodByName('prototype.__delete__locations', true);
    Building.disableRemoteMethodByName('prototype.__destroyById__locations', true);
    Building.disableRemoteMethodByName('prototype.__updateById__locations', true);
    Building.disableRemoteMethodByName('prototype.__findById__locations', true);


/*
    Building.beforeRemote('**', function(ctx ,user,next) {
      console.log('ctx.methodString', ctx.methodString)
    })
    */
}
