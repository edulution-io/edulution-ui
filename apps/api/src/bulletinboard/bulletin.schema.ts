import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Attendee from '../conferences/attendee.schema';

export type BulletinDocument = Bulletin & Document;

@Schema({ timestamps: true, strict: true })
export class Bulletin {
  @Prop({ type: Object, required: true })
  creator: Attendee;

  @Prop({ type: Object })
  updatedBy?: Attendee;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Boolean, default: true, required: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'BulletinCategory', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  attachmentFileNames: string[];

  @Prop({ type: [Date, null], required: false })
  isVisibleStartDate: Date | null;

  @Prop({ type: [Date, null], required: false })
  isVisibleEndDate: Date | null;
}

export const BulletinSchema = SchemaFactory.createForClass(Bulletin);

BulletinSchema.set('toJSON', {
  virtuals: true,
});
