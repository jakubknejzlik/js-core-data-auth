const jwt = require("jwt-simple");
const inflection = require("inflection");

const passwordLib = require("./password");

module.exports = (database, username, password, options) => {
  options = options || {};
  const context = database.createContext();

  const userEntityName = options.userEntityName || "User";
  const userUsernameColumn = options.userUsernameColumn || "username";
  const userPasswordColumn = options.userPasswordColumn || "password";
  const userTokenRelationshipName =
    options.userTokenRelationshipName || "tokens";
  const tokenEntityName = options.tokenEntityName || "Token";
  const tokenAttributeName = options.tokenAttributeName || "SELF.token";
  const jwtSecret = options.jwtSecret || "JWT_SECRET";

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

      let setter = `add${inflection.singularize(inflection.camelize(userTokenRelationshipName))}`;

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
