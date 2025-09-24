const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Customer = require("./backend/Models/CustomerModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        let user = await Customer.findOne({ mail: email });

        if (!user) {
          user = await Customer.create({
            ID: null,
            name: profile.displayName,
            mail: email,
            password: "__google_oauth__",
            isOAuth: true,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Customer.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;