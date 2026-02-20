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

import { IsArray, IsBoolean, IsDate, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinSaveModeType from '@libs/bulletinBoard/types/bulletinSaveModeType';
import BULLETIN_SAVE_MODE from '@libs/bulletinBoard/constants/bulletinSaveMode';
import CUSTOM_PUSH_BODY_MAX_LENGTH from '@libs/bulletinBoard/constants/customPushBodyMaxLength';

class CreateBulletinDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  attachmentFileNames: string[];

  @IsBoolean()
  isActive: boolean;

  @ValidateNested()
  category: BulletinCategoryResponseDto;

  @IsDate()
  isVisibleStartDate: Date | null;

  @IsDate()
  isVisibleEndDate: Date | null;

  @IsOptional()
  @IsString()
  customPushTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(CUSTOM_PUSH_BODY_MAX_LENGTH)
  customPushBody?: string;

  @IsOptional()
  @IsIn(Object.values(BULLETIN_SAVE_MODE))
  saveMode?: BulletinSaveModeType;
}

export default CreateBulletinDto;
