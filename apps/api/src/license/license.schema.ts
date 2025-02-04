import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LicenseDocument = License & Document;

@Schema({ strict: true })
export class License {
  @Prop({ default: '' })
  customerId: string;

  @Prop({ default: '' })
  hostname: string;

  @Prop({ default: 0 })
  numberOfUsers: number;

  @Prop({ default: '' })
  licenseKey: string;

  @Prop({ default: '' })
  token: string;

  @Prop({ type: Date, default: new Date() })
  validFromUtc: Date;

  @Prop({ type: Date, default: '' })
  validToUtc: Date;

  @Prop({ default: false })
  isLicenseActive: boolean;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
