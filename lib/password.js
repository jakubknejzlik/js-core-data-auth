const sha512 = require("js-sha512");

module.exports = {
  generatePassword: (password, options) => {
    return sha512(password).toString();
  }
};
