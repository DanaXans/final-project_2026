import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { ActivationToken, ActivationTokenSchema } from './activation-token.schema';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ActivationToken.name, schema: ActivationTokenSchema },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
