/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
