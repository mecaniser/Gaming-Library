var LocalStrategy = require("passport-local").Strategy;

var User = require("../models/User");

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        process.nextTick(function() {
          var name = req.body.name;
          var game;
          // this func wont fire unless data is sent back.
          User.findOne({ "local.email": email }, function(err, user) {
            if (err) {
              return done(err);
            }
            if (user) {
              return done(
                null,
                false,
                req.flash("signupMessage", "That email is already taken.")
              );
            } else {
              var newUser = new User();
              newUser.local.email = email;
              newUser.name = name;
              newUser.game = game;
              newUser.local.password = newUser
                .generateHash(password)
                .toString();

              newUser.save(function(err) {
                if (err) {
                  throw err;
                }
                return done(null, newUser);
              });
            }
          });
        });
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        User.findOne({ "local.email": email }, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            console.log("inccorect email");
            return done(
              null,
              false,
              req.flash("loginMessage", "No user found")
            );
          }

          if (!user.validPassword(password)) {
            return done(
              null,
              false,
              req.flash("loginMessage", "Incorrect Password.")
            );
          }

          return done(null, user);
        });
      }
    )
  );
};
