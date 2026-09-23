import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ActivateDto, LoginDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('activate/:token')
  activate(@Param('token') token: string, @Body() body: ActivateDto) {
    return this.authService.activate(token, body.password, body.confirmPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req) {
    return req.user;
  }
}
