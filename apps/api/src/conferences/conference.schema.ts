/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import { Group } from '@libs/groups/types/group';
import Attendee from './attendee.schema';

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

  @Prop({ required: true, default: uuidv4() })
  meetingID: string;

  @Prop({ required: true })
  creator: Attendee;

  @Prop({ type: String, default: undefined })
  password?: string;

  @Prop({ default: false })
  isRunning: boolean;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ required: true })
  invitedAttendees: Attendee[];

  @Prop({ required: true })
  invitedGroups: Group[];

  @Prop()
  joinedAttendees: Attendee[];
}

export const ConferenceSchema = SchemaFactory.createForClass(Conference);
