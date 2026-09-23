import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('wrong email or password');
    }
    if (user.is_banned) {
      throw new UnauthorizedException('user is banned');
    }
    if (!user.is_active) {
      throw new UnauthorizedException('user is not active');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('wrong email or password');
    }

    await this.usersService.updateLastLogin(user._id.toString());

    const token = this.jwtService.sign({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
      },
    };
  }

  async activate(token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('passwords do not match');
    }
    const found = await this.usersService.findToken(token);
    if (!found) {
      throw new BadRequestException('token is invalid');
    }
    if (found.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('token expired');
    }
    await this.usersService.setPassword(found.userId, password);
    return { message: 'ok' };
  }
}
