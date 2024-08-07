import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type MailProviderDocument = MailProvider & Document;

@Schema()
export class MailProvider {
  @Prop({ required: true, default: uuidv4() })
  mailProviderId: string;

  @Prop({ required: true, default: '' })
  name: string;

  @Prop({ required: true, default: '' })
  label: string;

  @Prop({ required: true, default: '' })
  host: string;

  @Prop({ type: Number, required: true, default: 993 }) port: number | null;

  @Prop({ required: true, default: false })
  secure: boolean;
}

export const MailProviderSchema = SchemaFactory.createForClass(MailProvider);
