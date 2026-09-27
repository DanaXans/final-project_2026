import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { Order } from './orders/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('MYSQL_HOST'),
        port: Number(config.get('MYSQL_PORT')),
        username: config.get('MYSQL_USER'),
        password: config.get('MYSQL_PASSWORD') || '',
        database: config.get('MYSQL_DB'),
        entities: [Order],
        synchronize: true,
        extra:
          config.get('MYSQL_SSL') === 'true'
            ? { ssl: { rejectUnauthorized: false } }
            : undefined,
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URI'),
        dbName: 'crm_school',
      }),
    }),
    UsersModule,
    AuthModule,
    OrdersModule,
    GroupsModule,
    AdminModule,
  ],
})
export class AppModule {}
