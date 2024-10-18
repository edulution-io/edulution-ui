import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LicenseDocument = License & Document;

@Schema({ strict: true })
export class License {
  @Prop({ default: '' })
  licenseKey: string;

  @Prop({ type: Date, default: new Date() })
  validFromUtc: Date;

  @Prop({ type: Date, default: '' })
  validToUtc: Date;

  @Prop({ default: false })
  isLicenseActive: boolean;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
