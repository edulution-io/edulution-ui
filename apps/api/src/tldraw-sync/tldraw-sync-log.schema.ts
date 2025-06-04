import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import Attendee from '../conferences/attendee.schema';

@Schema({ timestamps: true, strict: true })
export class TLDrawSyncLog {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  attendee: Attendee;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  message: Record<string, unknown>;
}

export type TLDrawSyncLogDocument = TLDrawSyncLog & Document;
export const TLDrawSyncLogSchema = SchemaFactory.createForClass(TLDrawSyncLog);

TLDrawSyncLogSchema.set('toJSON', {
  virtuals: true,
});
