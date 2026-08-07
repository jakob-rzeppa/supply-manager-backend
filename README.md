The backend for a supply management system. You can create products with a EAN (European Article Number) and change the amount of the product (with expiration dates).

## What is used?

Routes / Middleware: Express Js

Types: typescript

Testing: jest

Database: MongoDB / mongoose

Validation: Joi

Error Handling: Custom Errors

Auth: jsonwebtoken

Documentation: Swagger

## How to use the application locally?

First make sure to install docker.

Add a .env file in the root dir and add these environment variables:

```
PORT=3060
MONGO_URI=mongodb://mongodb:27017/supply-manager-db
ACCESS_TOKEN_SECRET=yourAccessTokenSecret
```

Execute this command to build the images of the database and application and run them:

```
docker-compose up --build
```

The --build flag is for rebuilding the service after making changes and not deleting the previously created image.

Don't forget to use `docker-compose down` to stop docker.

## API Docs

After the application is running go to this url:

```
http://localhost:3060/api-docs
```

to see the swagger documentation of the API.

## Auth

JsonWebTokens are used for authentication and authorization of users.
To log in get the accessToken (expires in 30m) from this route: POST /auth/login.
Now you can access the products by adding the token in the header:

```
"authorization": "bearer [accessToken]"
```

Make sure to logout (DELETE /auth/logout with the body { "token": yourToken }).

## What is next?

- Email verification
- Reorganizing file structure
- Splitting the logic in productsRoutes into smaller portions
- Tests for productsRoutes and authRoutes
- Integration tests with the aatabase
- End to End tests
- Check if using refreshTokens is necessery / sensible
- Implement logging
- Implement a CI/CD pipeline using Github Actions
- Delete accessToken from db after it expires
