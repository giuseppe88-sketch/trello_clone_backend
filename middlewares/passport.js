const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const models= require("../models");

const users = models.Users;
const JWTStrategy = passportJWT.Strategy; //jwt strategy assign to a variable
const ExtractJWT = passportJWT.ExtractJwt; // extract method from header assign to a variable

passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, callback) => {
        try {
          console.log(`Authenticating user: ${username}`);
          const user = await users.findOne({ username: username });
          if (!user) {
            console.log("Incorrect username");
            return callback(null, false, {
              message: "Incorrect username or password.",
            });
          }
          if (!user.validatePassword(password)) {
            console.log("Incorrect password");
            return callback(null, false, { message: "Incorrect password." });
          }
          console.log("User authenticated successfully");
          return callback(null, user);
        } catch (error) {
          console.error("Error finding user:", error);
          return callback(error);
        }
      }
    )
  );
  
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: "your_jwt_secret",
      },
      async (jwtPayload, callback) => {
        try {
          console.log(`Processing JWT for user ID: ${jwtPayload._id}`);
          const user = await users.findById(jwtPayload._id);
          if (!user) {
            return callback(null, false, { message: "User not found" });
          }
          return callback(null, user);
        } catch (error) {
          console.error("Error processing JWT:", error);
          return callback(error);
        }
      }
    )
  );
  
  const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy
  
  const jwt = require('jsonwebtoken');
  
  let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
      subject: user.username, //  username you’re encoding in the JWT
      expiresIn: '7d', //  the token will expire in 7 days
      algorithm: 'HS256' // algorithm used to “sign” or encode the values of the JWT
    });
  }
  
