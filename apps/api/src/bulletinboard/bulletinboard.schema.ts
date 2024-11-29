import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Attendee from '../conferences/attendee.schema';

export type BulletinDocument = Bulletin & Document;

@Schema({ timestamps: true })
export class Bulletin {
  @Prop({ type: Object, required: true })
  creator: Attendee;

  @Prop({ type: Object })
  updatedBy?: Attendee;

  @Prop({ required: true })
  heading: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'BulletinBoardCategory', required: true })
  category: Types.ObjectId;

  @Prop()
  isVisibleStartDate?: Date;

  @Prop()
  isVisibleEndDate?: Date;
}

export const BulletinSchema = SchemaFactory.createForClass(Bulletin);

export default BulletinSchema;
