const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
      subject: user.username, //  username you’re encoding in the JWT
      expiresIn: '7d', //  the token will expire in 7 days
      algorithm: 'HS256' // algorithm used to “sign” or encode the values of the JWT
    });
  }
  
  module.exports = (router) => {
    router.post('/login', (req, res) => {
      passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error) {
          console.error("Error during authentication:", error);
          return res.status(500).json({ message: 'Internal server error' });
        }
        if (!user) {
          console.log("Authentication failed:", info.message);
          return res.status(400).json({
            message: info.message,
            user: user
          });
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            console.error("Error during login:", error);
            return res.status(500).json({ message: 'Internal server error' });
          }
          let token = generateJWTToken(user.toJSON());
          return res.json({ user, token });
        });
      })(req, res);
    });
  }