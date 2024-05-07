import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConferenceDocument = Conference & Document;

@Schema()
export class Conference {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  meetingID: string;

  @Prop()
  url: string;

  @Prop()
  password: string;

  @Prop()
  isMeetingStarted: string;
}

export const ConferenceSchema = SchemaFactory.createForClass(Conference);
