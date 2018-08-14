const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const user = mongoose.model('users');
const keys = require('./keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = (passport) => {
  passport.use(new jwtStrategy(opts, (jwtPayload, done)=>{
    user.findById(jwtPayload.id)
    .then(user => {
      if (user) {
          return done(null, user)
      }
      return done(null, false)
    })
    .catch(err => console.log(err))
  }))
}