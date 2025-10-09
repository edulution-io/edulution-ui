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

import { useEffect, useState } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import normalizeLdapHomeDirectory from '@libs/filesharing/utils/normalizeLdapHomeDirectory';

const useUserPath = () => {
  const { user: lmnUser } = useLmnApiStore();
  const { isSuperAdmin } = useLdapGroups();
  const { isGeneric } = useDeploymentTarget();

  const [homePath, setHomePath] = useState<string>('');

  useEffect(() => {
    if (isSuperAdmin || isGeneric) {
      setHomePath('/');
    } else setHomePath(normalizeLdapHomeDirectory(lmnUser?.homeDirectory || ''));
  }, [isSuperAdmin, isGeneric, lmnUser]);

  return { homePath };
};

export default useUserPath;
