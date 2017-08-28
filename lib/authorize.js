const jwt = require("jwt-simple");
const inflection = require("inflection");

const passwordLib = require("./password");
const defaults = require("./defaults");

module.exports = (database, username, password, options) => {
  options = options || {};
  const context = database.createContext();

  let _defaults = defaults(options);
  let userEntityName = _defaults.userEntityName;
  let userUsernameColumn = _defaults.userUsernameColumn;
  let userPasswordColumn = _defaults.userPasswordColumn;
  let userTokenRelationshipName = _defaults.userTokenRelationshipName;
  let tokenEntityName = _defaults.tokenEntityName;
  let tokenAttributeName = _defaults.tokenAttributeName;
  let jwtSecret = _defaults.jwtSecret;

  const passwordHash = passwordLib.generatePassword(password, options);

  let where = {};
  where[userUsernameColumn] = username;

  return context
    .getObject(userEntityName, {
      where: where
    })
    .then(user => {
      if (!user || user[userPasswordColumn] != passwordHash)
        throw new Error("invalid credentials");

      // console.log('got user',user.id,username)
      let token = context.create(tokenEntityName);
      token[tokenAttributeName] = jwt.encode(
        { token: token[tokenAttributeName] },
        jwtSecret || "JWT_SECRET"
      );

      let setter = `add${inflection.singularize(
        inflection.camelize(userTokenRelationshipName)
      )}`;

      user[setter](token);
      return context.save().then(() => {
        return {
          access_token: token,
          user: user
        };
      });
    })
    .finally(() => {
      context.destroy();
    });
};
