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
}

export default MobileAppUserDto;
