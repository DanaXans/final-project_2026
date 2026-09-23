import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key_for_crm',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.id);
    if (!user || user.is_banned) {
      return null;
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    };
  }
}
