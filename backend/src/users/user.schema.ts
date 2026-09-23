import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  surname: string;

  @Prop({ default: '' })
  password: string;

  @Prop({ default: 'manager' })
  role: string;

  @Prop({ default: false })
  is_active: boolean;

  @Prop({ default: false })
  is_banned: boolean;

  @Prop({ default: null })
  last_login: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
