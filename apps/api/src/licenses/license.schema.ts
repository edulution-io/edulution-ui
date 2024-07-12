import mongoose, { Document } from 'mongoose';
import { crypto } from 'cryptojs';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LicenseDocument = License & Document;

@Schema()
export class License {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  publicKey: crypto.KeyObject;

  @Prop({ type: String, required: true })
  signature: string;

  @Prop({ type: String, required: true })
  platformFrontendUrl: string;

  @Prop({ type: String, required: true })
  platformOwnerAddress: string;

  @Prop({ type: Date, required: true })
  validFromUtc: Date;

  @Prop({ type: Date, required: true })
  validToUtc: Date;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
