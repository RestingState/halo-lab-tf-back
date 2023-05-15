import passport from 'passport';
import { Strategy as JWTstrategy, ExtractJwt } from 'passport-jwt';

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.SECRET_KEY as string,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
