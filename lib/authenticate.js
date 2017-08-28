const inflection = require("inflection");
const defaults = require("./defaults");

module.exports = (database, token, options) => {
  options = options || {};
  token = token.replace("Bearer ", "");

  const context = database.createContext();

  let _defaults = defaults(options);
  let tokenEntityName = _defaults.tokenEntityName;
  let tokenAttributeName = _defaults.tokenAttributeName;
  let tokenUserRelationshipName = _defaults.tokenUserRelationshipName;

  let tokenUserGetter = `get${inflection.camelize(tokenUserRelationshipName)}`;

  let where = {};
  where[tokenAttributeName] = token;

  return context
    .getObject(tokenEntityName, {
      where: where
    })
    .then(_token => {
      if (!_token) throw new Error(`invalid token ${token}`);
      return _token[tokenUserGetter]().then(user => {
        if (!user) throw new Error("token has no associated user");
        return {
          access_token: _token,
          user: user
        };
      });
    })
    .finally(() => {
      context.destroy();
    });
};
