const jwt = require("jwt-simple");

const passwordLib = require("./password");

module.exports = (database, username, password, options) => {
  options = options || {};
  const context = database.createContext();

  const userEntityName = options.userEntityName || "User";
  const userUsernameAttributeName =
    options.userUsernameAttributeName || "username";
  const tokenEntityName = options.tokenEntityName || "Token";
  const tokenAttributeName = options.tokenAttributeName || "SELF.token";
  const jwtSecret = options.jwtSecret || "JWT_SECRET";

  const passwordHash = passwordLib.generatePassword(password, options);

  let where = {};
  where[userUsernameAttributeName] = username;

  return context
    .getObject(userEntityName, {
      where: where
    })
    .then(user => {
      if (!user || user.password != passwordHash)
        throw new Error("invalid credentials");

      // console.log('got user',user.id,username)
      let token = context.create(tokenEntityName);
      token[tokenAttributeName] = jwt.encode(
        { token: token[tokenAttributeName] },
        jwtSecret || "JWT_SECRET"
      );
      user.addToken(token);
      return context.save().then(() => {
        return {
          token: token,
          user: user
        };
      });
    })
    .finally(() => {
      context.destroy();
    });
};
