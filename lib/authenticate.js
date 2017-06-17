module.exports = (database, token, options) => {
  options = options || {};
  token = token.replace("Bearer ", "");

  const context = database.createContext();

  const tokenEntityName = options.tokenEntityName || "Token";
  const tokenAttributeName = options.tokenAttributeName || "SELF.token";

  let where = {};
  where[tokenAttributeName] = token;

  return context
    .getObject(tokenEntityName, {
      where: where
    })
    .then(_token => {
      if (!_token) throw new Error(`invalid token ${token}`);
      return _token.getUser().then(user => {
        if (!user) throw new Error("token has no associated user");
        return {
          token: _token,
          user: user
        };
      });
    })
    .finally(() => {
      context.destroy();
    });
};
