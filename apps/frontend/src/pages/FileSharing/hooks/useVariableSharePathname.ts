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

import { useCallback, useEffect } from 'react';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import useLmnApiStore from '@/store/useLmnApiStore';
import appendSlashToUrl from '@libs/common/utils/URL/appendSlashToUrl';
import getUserAttributValue from '@libs/lmnApi/utils/getUserAttributValue';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';

const useVariableSharePathname = () => {
  const { isLmn } = useDeploymentTarget();
  const lmnUser = useLmnApiStore((s) => s.user);
  const getOwnUser = useLmnApiStore((s) => s.getOwnUser);

  useEffect(() => {
    void getOwnUser();
  }, [getOwnUser]);

  const createVariableSharePathname = useCallback(
    (pathname: string, pathVariables?: MultipleSelectorOptionSH[]) => {
      if (isLmn && Array.isArray(pathVariables) && pathVariables.length > 0) {
        const variablePath = pathVariables
          .map((variable) => getUserAttributValue(lmnUser, variable.label as keyof LmnUserInfo))
          .filter(Boolean)
          .join('/');

        return appendSlashToUrl(`${pathname}${variablePath}`);
      }

      return pathname;
    },
    [isLmn, lmnUser],
  );

  return { createVariableSharePathname };
};

export default useVariableSharePathname;
