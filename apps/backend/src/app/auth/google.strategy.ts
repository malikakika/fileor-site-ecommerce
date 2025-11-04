import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?? '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://api.fileor.roadshine.ma/auth/google/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      name: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
      picture: photos?.[0]?.value,
      provider: 'google',
    };
    done(null, user);
  }
}
