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

    passport.use("local-signup", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    },
    function(req, email, password, done) {
        process.nextTick(function() {   // this func wont fire unless data is sent back.
            User.findOne({"local.email" : email }, function(err, user) {
                if(err) { return done(err);}
                if(user) {
                    return done(null, false, req.flash("signupMessage", "That email is already taken."));
                } else {

                    var newUser = new User();
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password).toString();

                    newUser.save(function(err) {
                        if(err) { throw err; }
                        return done(null, newUser);
                    });
                }
            });

        });
    }));

};
