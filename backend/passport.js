import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {
  // Create a user object with only the needed information
  const user = {
    id: profile.id,
    email: profile.emails[0].value,
    displayName: profile.displayName,
    provider: 'google'
  };
  return done(null, user);
}));

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  // jwtPayload contains the user object we created in GoogleStrategy
  return done(null, jwtPayload.user);
}));

// Token generation function
export const generateToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// Serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;