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

import GroupForm from '@libs/groups/types/groupForm';
import MinimizedGroupForm from '@libs/groups/types/minimizedGroupForm';
import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';

const minimizeFormValues = (formValues: GroupForm): MinimizedGroupForm => ({
  ...formValues,
  admins: formValues.admins.map((m) => m.value),
  admingroups: formValues.admingroups.map((m) => m.name),
  members: formValues.members.map((m) => m.value),
  membergroups: formValues.membergroups.map((m) => m.name),
  proxyAddresses: formValues.proxyAddresses.split(',').filter(Boolean),
  quota: JSON.parse(formValues.quota || '[]') as LmnApiProjectQuota[],
});

export default minimizeFormValues;
