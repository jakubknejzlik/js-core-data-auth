const Router = require("express").Router;

const authorize = require("./lib/authorize");
const authenticate = require("./lib/authenticate");

const authorization = (database, options) => {
  return (req, res, next) => {
    const username = req.body.username || req.body.login || req.body.email;
    const password = req.body.password;

    authorize(database, username, password, options)
      .then(result => {
        res.status(201).send({
          token: result.token.token,
          user: result.user
        });
      })
      .catch(next);
  };
};
const authentication = (database, options) => {
  return (req, res, next) => {
    const token =
      req.headers.authorization || req.query.token || req.query.access_token;

    if (!token) {
      return res
        .status(401)
        .send(
          "Unauthorized (neither authorization header or access_token is provided)"
        );
    }

    authenticate(database, token, options)
      .then(credentials => {
        req.credentials = credentials;
        next();
      })
      .catch(next);
  };
};

const auth = (database, options) => {
  const router = new Router();

  router.post("/authorize", authorization(database, options));
  router.use(authentication(database, options));

  return router;
};

module.exports = {
  authorization: authorization,
  authentication: authentication,
  auth: auth
};
