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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import APPS from '@libs/appconfig/constants/apps';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';

const useWikiMenuConfig = (): MenuBarEntry => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { registrations, fetchRegistrations, selectRegistration, fetchPageContent, fetchPages } = useWikiStore();

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const firstPathPart = pathParts[0] || '';
  const previousFirstPathPart = useRef<string | null>(null);

  useEffect(() => {
    if (firstPathPart !== previousFirstPathPart.current) {
      previousFirstPathPart.current = firstPathPart;
      if (firstPathPart === APPS.WIKI) {
        void fetchRegistrations();
      }
    }
  }, [firstPathPart]);

  const handleRegistrationClick = useCallback(
    (registrationId: string) => {
      selectRegistration(registrationId);
      navigate(`/${APPS.WIKI}/${registrationId}`);
      void fetchPages(registrationId);
      void fetchPageContent(registrationId, WIKI_CONSTANTS.INDEX_PAGE_NAME);
    },
    [navigate, selectRegistration, fetchPages, fetchPageContent],
  );

  const menuItems = useMemo(
    () =>
      registrations.map((reg) => ({
        id: reg.id,
        label: reg.name,
        icon: faBook,
        action: () => handleRegistrationClick(reg.id),
        disableTranslation: true,
      })),
    [registrations, handleRegistrationClick],
  );

  return useMemo(
    () => ({
      title: 'wiki.appTitle',
      icon: faBook,
      color: 'hover:bg-ciGreenToBlue',
      appName: APPS.WIKI,
      menuItems,
    }),
    [menuItems],
  );
};

export default useWikiMenuConfig;
