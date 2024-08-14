import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import MailEncryption from '@libs/mail/constants/mailEncryption';
import { TMailEncryption } from '@libs/mail/types';

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

  @Prop({ type: String, required: true, default: '' }) port: string;

  @Prop({ type: String, required: true, default: MailEncryption.SSL })
  encryption: TMailEncryption;
}

export const MailProviderSchema = SchemaFactory.createForClass(MailProvider);
