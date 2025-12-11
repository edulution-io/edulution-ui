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

import { ApiProperty } from '@nestjs/swagger';
import OrganisationInfoDto from '@libs/global-settings/types/organisationInfoDto';
import MobileUserFileShare from '@libs/mobileApp/types/mobileUserFileShare';

class MobileAppUserDto {
  @ApiProperty() username: string;

  @ApiProperty() firstName: string;

  @ApiProperty() lastName: string;

  @ApiProperty() role: string;

  @ApiProperty() email: string;

  @ApiProperty() birthDate: string;

  @ApiProperty() expirationDate: string;

  @ApiProperty() school: string;

  @ApiProperty() classes: string[];

  @ApiProperty() userProfilePicture: string;

  @ApiProperty() institutionLogo: string;

  @ApiProperty() deploymentTarget: string;

  @ApiProperty({ type: () => OrganisationInfoDto })
  organisationInfo: OrganisationInfoDto;

  @ApiProperty({ type: () => MobileUserFileShare })
  userShares: MobileUserFileShare[];

  @ApiProperty()
  totpCreatedAt?: Date | null;
}

export default MobileAppUserDto;
