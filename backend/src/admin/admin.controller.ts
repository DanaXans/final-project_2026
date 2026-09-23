import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateManagerDto } from '../auth/dto';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private ordersService: OrdersService,
    private config: ConfigService,
  ) {}

  @Get('stats')
  stats() {
    return this.ordersService.stats();
  }

  @Get('managers')
  async managers(@Query('page') page = '1') {
    const current = Number(page) || 1;
    const [items, total] = await this.usersService.getManagers(current);
    const data = [];
    for (const user of items) {
      const stats = await this.ordersService.statsForManager([
        user.email,
        user.surname,
      ]);
      data.push({
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        is_active: user.is_active,
        last_login: user.last_login,
        stats,
      });
    }
    return { data, page: current, total, totalPages: Math.ceil(total / 10) || 1 };
  }

  @Post('managers')
  async create(@Body() dto: CreateManagerDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('email already used');
    }
    return this.usersService.createManager(dto);
  }

  @Post('managers/:id/activate')
  async activate(@Param('id') id: string) {
    const frontend = this.config.get('FRONTEND_URL') || 'http://localhost:5173';
    const link = await this.usersService.makeActivationLink(id, frontend);
    return { link };
  }

  @Patch('managers/:id/ban')
  ban(@Param('id') id: string) {
    return this.usersService.setBanned(id, true);
  }

  @Patch('managers/:id/unban')
  unban(@Param('id') id: string) {
    return this.usersService.setBanned(id, false);
  }
}
