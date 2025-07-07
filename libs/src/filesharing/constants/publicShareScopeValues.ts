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

import type RadioGroupItem from '@libs/ui/types/radioGroupItem';
import { GlobeIcon, UserIcon } from '@libs/assets';
import PUBLIC_SHARE_LINK_SCOPE from '@libs/filesharing/constants/publicShareLinkScope';

const PUBLIC_SHARE_SCOPE_FORM_VALUES: RadioGroupItem[] = [
  {
    value: PUBLIC_SHARE_LINK_SCOPE.PUBLIC,
    translationId: 'filesharing.publicFileSharing.scope.public',
    descriptionTranslationId: 'filesharing.publicFileSharing.scope.publicHint',
    disabled: false,
    icon: UserIcon,
  },
  {
    value: PUBLIC_SHARE_LINK_SCOPE.RESTRICTED,
    translationId: 'filesharing.publicFileSharing.scope.restricted',
    descriptionTranslationId: 'filesharing.publicFileSharing.scope.restrictedHint',
    disabled: false,
    icon: GlobeIcon,
  },
];

export default PUBLIC_SHARE_SCOPE_FORM_VALUES;
