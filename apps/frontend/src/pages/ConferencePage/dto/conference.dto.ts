import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import CreateConferenceDto from './create-conference.dto';

@Schema()
export class Conference {
  constructor(mockConference: CreateConferenceDto, creator: string) {
    this.name = mockConference.name;
    this.meetingID = uuidv4();
    this.creator = creator;
    this.password = mockConference.password;
    this.attendees = mockConference.attendees;
    this.isRunning = false;
  }

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  meetingID: string;

  @Prop({ required: true })
  creator: string;

  @Prop({ type: String, default: undefined })
  password?: string;

  @Prop({ default: false })
  isRunning: boolean;

  @Prop({ required: true })
  attendees: string[];
}

export const ConferenceSchema = SchemaFactory.createForClass(Conference);
