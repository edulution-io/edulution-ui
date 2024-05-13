import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConferenceDocument = Conference & Document;

@Schema()
export class Conference {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  meetingID: string;

  @Prop({ required: true })
  creator: string;

  @Prop({ type: String, default: undefined })
  password?: string;

  @Prop({ default: false })
  isMeetingStarted: boolean;

  @Prop({ required: true })
  attendees: string[];
}

export const ConferenceSchema = SchemaFactory.createForClass(Conference);
