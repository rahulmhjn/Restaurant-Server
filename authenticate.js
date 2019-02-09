var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
//to support sessions we use serialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());