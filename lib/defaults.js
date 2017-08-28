module.exports = options => {
  return {
    userEntityName: options.userEntityName || "User",
    userUsernameColumn: options.userUsernameColumn || "username",
    userPasswordColumn: options.userPasswordColumn || "password",
    userTokenRelationshipName:
      options.userTokenRelationshipName || "accessTokens",
    tokenEntityName: options.tokenEntityName || "AccessToken",
    tokenAttributeName: options.tokenAttributeName || "SELF.token",
    tokenUserRelationshipName: options.tokenUserRelationshipName || "user",
    jwtSecret: options.jwtSecret || "JWT_SECRET"
  };
};
