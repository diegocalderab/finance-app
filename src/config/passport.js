const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AppleStrategy = require("passport-apple");
const prisma = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
        if (!user) {
          const email = profile.emails?.[0]?.value;
          user = await prisma.user.upsert({
            where: { email },
            update: { googleId: profile.id },
            create: {
              email,
              googleId: profile.id,
              name: profile.displayName || "Usuario",
              avatarUrl: profile.photos?.[0]?.value,
            },
          });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
      callbackURL: process.env.APPLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const appleId = profile.id || profile.sub;
        let user = await prisma.user.findUnique({ where: { appleId } });
        if (!user) {
          const email = profile.email;
          user = await prisma.user.upsert({
            where: { email },
            update: { appleId },
            create: { email, appleId, name: email ? email.split("@")[0] : "Usuario Apple" },
          });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
