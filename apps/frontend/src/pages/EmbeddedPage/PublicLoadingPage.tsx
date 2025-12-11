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

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import useUserStore from '@/store/UserStore/useUserStore';

const PublicLoadingPage = () => {
  const { publicAppConfigs, isGetPublicAppConfigsLoading } = useAppConfigsStore();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated || isGetPublicAppConfigsLoading) return;

    if (publicAppConfigs.length > 0) {
      const currentPath = location.pathname.replace(/^\//, '');
      const hasMatch = publicAppConfigs.some((cfg) => cfg.name === currentPath);

      if (hasMatch) {
        return;
      }
    }

    navigate(LOGIN_ROUTE, {
      replace: true,
      state: { from: location.pathname },
    });
  }, [isGetPublicAppConfigsLoading, publicAppConfigs, location.pathname]);

  return <div />;
};

export default PublicLoadingPage;
