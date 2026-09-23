import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivationTokenDocument = ActivationToken & Document;

@Schema()
export class ActivationToken {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const ActivationTokenSchema = SchemaFactory.createForClass(ActivationToken);
