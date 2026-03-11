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

import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import type Section from '@libs/menubar/section';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import useSubMenuStore from '@/store/useSubMenuStore';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';

const useRegisterWikiPageSections = (registrationId: string) => {
  const { t } = useTranslation();
  const { pages, selectPage, startNewPage, fetchPageContent } = useWikiStore();
  const { setSections, setActiveSection } = useSubMenuStore();

  const handleNewPage = useCallback(() => {
    startNewPage();
    setActiveSection(WIKI_CONSTANTS.NEW_PAGE_SECTION_ID);
  }, [startNewPage, setActiveSection]);

  const sections: Section[] = useMemo(
    () => [
      {
        id: WIKI_CONSTANTS.NEW_PAGE_SECTION_ID,
        label: t('wiki.newPage'),
        icon: faPlus,
        iconClassName: 'text-background',
        action: handleNewPage,
      },
      ...pages.map((page) => ({
        id: page.relativePath,
        label: page.title,
        action: () => {
          selectPage(page.relativePath);
          setActiveSection(page.relativePath);
          if (registrationId) {
            void fetchPageContent(registrationId, page.relativePath);
          }
        },
      })),
    ],
    [pages, selectPage, setActiveSection, fetchPageContent, registrationId, handleNewPage, t],
  );

  useEffect(() => {
    if (!registrationId) {
      setSections([]);
      return () => {};
    }
    setSections(sections, registrationId);
    return () => setSections([]);
  }, [sections, registrationId, setSections]);
};

export default useRegisterWikiPageSections;
