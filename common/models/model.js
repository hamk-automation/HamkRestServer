module.exports = function(Post) {
  Post.disableRemoteMethod('__get__tags', true);
  Post.disableRemoteMethod('__create__tags', true);
  Post.disableRemoteMethod('__destroyById__accessTokens', true); // DELETE
  Post.disableRemoteMethod('__updateById__accessTokens', true); // PUT
};
