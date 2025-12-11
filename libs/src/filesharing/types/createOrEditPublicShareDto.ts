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

import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { Type } from 'class-transformer';
import { PublicShareLinkScopeType } from '@libs/filesharing/types/publicShareLinkScopeType';

class CreateOrEditPublicShareDto {
  @IsDate()
  @Type(() => Date)
  expires: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

  @IsString()
  share!: string;

  @IsString()
  filePath!: string;

  @IsString()
  filename!: string;

  @IsString()
  etag!: string;

  @IsArray()
  @IsOptional()
  invitedAttendees?: AttendeeDto[];

  @IsArray()
  @IsOptional()
  invitedGroups?: MultipleSelectorGroup[];

  @IsString()
  @IsOptional()
  password?: string;

  scope: PublicShareLinkScopeType;
}

export default CreateOrEditPublicShareDto;
