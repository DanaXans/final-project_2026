import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  getAll() {
    return this.groupsService.getAll();
  }

  @Post()
  create(@Body('name') name: string) {
    return this.groupsService.create(name);
  }
}
