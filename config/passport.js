import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.js";

const configurePassport = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:8000/api/v1/user/auth/google/callback";

  if (!clientId || !clientSecret) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret,
        callbackURL: callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account email not available"));
          }

          let user = await User.findOne({ email });
          if (!user) {
            const firstName = profile?.name?.givenName || "Google";
            const lastName = profile?.name?.familyName || "User";
            const randomPassword = uuidv4();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
              firstname: firstName,
              lastname: lastName,
              email,
              password: hashedPassword,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default configurePassport;
