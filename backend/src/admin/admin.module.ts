import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [UsersModule, OrdersModule],
  controllers: [AdminController],
})
export class AdminModule {}
