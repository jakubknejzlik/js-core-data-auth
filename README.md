# js-core-data-auth

[![Build Status](https://travis-ci.org/jakubknejzlik/js-core-data-auth.svg?branch=master)](https://travis-ci.org/jakubknejzlik/js-core-data-auth)

Authorization middleware for js-core-data

# Example

```
const CoreData = require("js-core-data");
const express = require('express');
const CoreDataAuth = require('js-core-data-auth');

const database = new CoreData(databaseUrl);
const app = express();

app.use(CoreDataAuth.auth(database));

app.listen(3000)
```

This can be applied to following schema:
```
User:
  columns:
    username: string
    password: string
  relationships:
    accessTokens:
      entity: AccessToken
      toMany: true
      inverse: user

AccessToken:
  columns:
    token: string
  relationships:
    user:
      entity: User
      inverse: tokens
```

# Custom schema

Let's say you have schema like this:
```
Customer:
  columns:
    email: string
    customPassword: string
  relationships:
    accessTokens:
      entity: CustomerToken
      toMany: true
      inverse: customer

CustomerToken:
  columns:
    hash:
      type: uuid
      default: uuidv4
  relationships:
    customer:
      entity: Customer
      inverse: accessTokens
```

You can authorize/authenticate user by specifying these options:

```
...
const authOptions = {
  userEntityName: "Customer",
  userUsernameColumn: "email",
  userPasswordColumn: "customPassword",
  userTokenRelationshipName: "accessTokens",
  tokenEntityName: "CustomerToken",
  tokenAttributeName: "hash",
  tokenUserRelationshipName: "customer"
};

...

app.use(CoreDataAuth.auth(database, authOptions));

```
