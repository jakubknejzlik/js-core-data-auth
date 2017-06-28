const assert = require("assert");
const fs = require("fs");
const CoreData = require("js-core-data");

const passwordLib = require("../lib/password");
const authorize = require("../lib/authorize");
const authenticate = require("../lib/authenticate");

describe("authorization", () => {
  describe("default schema", () => {
    const database = new CoreData("sqlite://:memory:");
    database.createModelFromYaml(fs.readFileSync(__dirname + "/schema.yml"));

    beforeEach(() => {
      return database.syncSchema({ force: true }).then(() => {
        const context = database.createContext();
        const user = context.create("User", {
          username: "test",
          password: passwordLib.generatePassword("test")
        });
        const token = context.create("Token", { token: "token" });
        token.setUser(user);
        return context.save();
      });
    });

    it("should authorize user", () => {
      return authorize(database, "test", "test").then(credentials => {
        assert.ok(credentials.token);
        assert.equal(credentials.user.username, "test");
      });
    });

    it("should authenticate user", () => {
      return authenticate(database, "token").then(credentials => {
        assert.ok(credentials.token);
        assert.equal(credentials.user.username, "test");
      });
    });
  });

  describe("custom schema", () => {
    const database = new CoreData("sqlite://:memory:");
    database.createModelFromYaml(
      fs.readFileSync(__dirname + "/schema.custom.yml")
    );

    const authOptions = {
      userEntityName: "Customer",
      userUsernameColumn: "email",
      userPasswordColumn: "customPassword",
      userTokenRelationshipName: "accessTokens",
      tokenEntityName: "CustomerToken",
      tokenAttributeName: "hash",
      tokenUserRelationshipName: "customer"
    };

    beforeEach(() => {
      return database.syncSchema({ force: true }).then(() => {
        const context = database.createContext();
        const user = context.create("Customer", {
          email: "test",
          customPassword: passwordLib.generatePassword("test")
        });
        const token = context.create("CustomerToken", { hash: "token" });
        token.setCustomer(user);
        return context.save();
      });
    });

    it("should authorize user", () => {
      return authorize(
        database,
        "test",
        "test",
        authOptions
      ).then(credentials => {
        assert.ok(credentials.token);
        assert.equal(credentials.user.email, "test");
      });
    });

    it("should authenticate user", () => {
      return authenticate(database, "token", authOptions).then(credentials => {
        assert.ok(credentials.token);
        assert.equal(credentials.user.email, "test");
      });
    });
  });
});
