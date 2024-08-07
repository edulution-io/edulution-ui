import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LicenseDocument = License & Document;

@Schema()
export class License {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ type: String, required: true })
  signature: string;

  @Prop({ type: String, required: true })
  platformOrganizationName: string;

  @Prop({ type: String, required: true })
  platformFrontendUrl: string;

  @Prop({ type: String, required: true })
  platformOwnerAddressPLZ: string;

  @Prop({ type: String, required: true })
  platformOwnerAddressCity: string;

  @Prop({ type: String, required: true })
  platformOwnerAddressStreet: string;

  @Prop({ type: String, required: true })
  platformOwnerAddressStreetNumber: string;

  @Prop({ type: Date, required: true })
  validFromUtc: Date;

  @Prop({ type: Date, required: true })
  validToUtc: Date;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
