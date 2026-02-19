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
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import type PairingStatusType from '@libs/pairing/types/pairingStatusType';

export type PairingDocument = Pairing & Document;

@Schema({ timestamps: true })
export class Pairing {
  @Prop({ type: String, required: true })
  parent: string;

  @Prop({ type: String, required: true })
  student: string;

  @Prop({ type: String, required: true })
  school: string;

  @Prop({ type: String, required: true, default: PAIRING_STATUS.PENDING })
  status: PairingStatusType;

  @Prop({ type: Number, default: 1 })
  schemaVersion: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PairingSchema = SchemaFactory.createForClass(Pairing);

PairingSchema.index({ parent: 1, student: 1 }, { unique: true });

PairingSchema.set('toJSON', {
  virtuals: true,
});
