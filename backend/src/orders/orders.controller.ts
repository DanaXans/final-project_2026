import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentDto, UpdateOrderDto } from './dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  getAll(@Query() query, @Req() req) {
    return this.ordersService.findAll(query, req.user);
  }

  @Get('excel')
  async excel(@Query() query, @Req() req, @Res() res: Response) {
    const buffer = await this.ordersService.exportExcel(query, req.user);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.send(Buffer.from(buffer));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @Req() req) {
    return this.ordersService.update(Number(id), dto, req.user);
  }

  @Post(':id/comments')
  comment(@Param('id') id: string, @Body() dto: CommentDto, @Req() req) {
    return this.ordersService.addComment(Number(id), dto.text, req.user);
  }
}
