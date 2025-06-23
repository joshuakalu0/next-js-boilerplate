const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../dal/mongo/userModel');
const config = require('../config');

const passport = require('passport');

passport.use(new GoogleStrategy({
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });

    if (user) {
      // Link Google account if not already linked
      if (!user.oauthProvider) {
        user.oauthProvider = 'google';
        user.oauthId = profile.id;
        user.name = user.name || profile.displayName;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        name: profile.displayName,
        oauthProvider: 'google',
        oauthId: profile.id,
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
