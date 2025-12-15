// I changed the secret to jwt access token secret which proved to be a game changer in fixing the bug 

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import UsersService  from '../../user/user.service';
import TokenPayload from '../interfaces/tokenPayload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
   // @Inject(ConfigService) private readonly configService: ConfigService,
     configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
   
    secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });

    // super({
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //   secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    // });
  }

  async validate(payload: TokenPayload) {
    return this.userService.getById(payload.userId);
  }

//   async validate(payload: TokenPayload) {
//     console.log('JWT Payload:', payload);
//     const user = await this.userService.getById(payload.userId);
//     console.log('Authenticated User:', user);

//     if (!user) {
//         throw new UnauthorizedException();
//     }
//     return user;
// }

}