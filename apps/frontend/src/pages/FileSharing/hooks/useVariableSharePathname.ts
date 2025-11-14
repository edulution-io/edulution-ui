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
