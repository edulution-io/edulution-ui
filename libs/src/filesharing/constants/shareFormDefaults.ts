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

import DEFAULT_FILE_LINK_EXPIRY from '@libs/filesharing/constants/defaultFileLinkExpiry';
import CreateOrEditPublicShareDto from '@libs/filesharing/types/createOrEditPublicShareDto';
import PUBLIC_SHARE_LINK_SCOPE from '@libs/filesharing/constants/publicShareLinkScope';

const SHARE_FORM_DEFAULTS: Partial<CreateOrEditPublicShareDto> = {
  scope: PUBLIC_SHARE_LINK_SCOPE.PUBLIC,
  expires: DEFAULT_FILE_LINK_EXPIRY,
  invitedAttendees: [],
  invitedGroups: [],
  password: '',
};

export default SHARE_FORM_DEFAULTS;
