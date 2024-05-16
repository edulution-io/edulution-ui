import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import CreateConferenceDto from './dto/create-conference.dto';
import { Attendee } from './dto/attendee';

export type ConferenceDocument = Conference & Document;

@Schema()
export class Conference {
  constructor(mockConference: CreateConferenceDto, creator: Attendee) {
    this.name = mockConference.name;
    this.meetingID = uuidv4();
    this.creator = creator;
    this.password = mockConference.password;
    this.invitedAttendees = mockConference.invitedAttendees;
    this.isRunning = false;
  }

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  meetingID: string;

  @Prop({ required: true })
  creator: Attendee;

  @Prop({ type: String, default: undefined })
  password?: string;

  @Prop({ default: false })
  isRunning: boolean;

  @Prop({ required: true })
  invitedAttendees: Attendee[];

  @Prop()
  joinedAttendees: Attendee[];
}

export const ConferenceSchema = SchemaFactory.createForClass(Conference);
