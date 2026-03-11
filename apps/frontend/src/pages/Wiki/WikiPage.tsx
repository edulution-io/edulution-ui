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
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import PageLayout from '@/components/structure/layout/PageLayout';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';
import WikiEditor from '@/pages/Wiki/components/WikiEditor';
import WikiCreateDialog from '@/pages/Wiki/components/WikiCreateDialog';
import WikiDeleteDialog from '@/pages/Wiki/components/WikiDeleteDialog';
import WikiFloatingButtonsBar from '@/pages/Wiki/components/WikiFloatingButtonsBar';
import useRegisterWikiPageSections from '@/pages/Wiki/hooks/useRegisterWikiPageSections';

const WikiPage = () => {
  const { t } = useTranslation();
  const { registrationId } = useParams<{ registrationId: string }>();
  const {
    selectedRegistrationId,
    selectedPagePath,
    isCreatingNewPage,
    selectRegistration,
    fetchPages,
    fetchPageContent,
  } = useWikiStore();

  useEffect(() => {
    if (registrationId && registrationId !== selectedRegistrationId) {
      selectRegistration(registrationId);
    } else if (!registrationId && selectedRegistrationId) {
      selectRegistration(null);
    }
  }, [registrationId]);

  useEffect(() => {
    if (selectedRegistrationId) {
      void fetchPages(selectedRegistrationId);
    }
  }, [selectedRegistrationId]);

  useEffect(() => {
    if (selectedRegistrationId && !selectedPagePath && !isCreatingNewPage) {
      void fetchPageContent(selectedRegistrationId, WIKI_CONSTANTS.INDEX_PAGE_NAME);
    }
  }, [selectedRegistrationId, selectedPagePath, isCreatingNewPage]);

  useRegisterWikiPageSections(selectedRegistrationId || '');

  const showEditor = selectedPagePath || isCreatingNewPage;

  return (
    <PageLayout>
      <div className="flex h-full flex-col">
        {showEditor ? (
          <WikiEditor />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">
              {registrationId ? t('wiki.selectPageFromSidebar') : t('wiki.selectWikiFromSidebar')}
            </p>
          </div>
        )}
      </div>

      <WikiCreateDialog />
      <WikiDeleteDialog />
      <WikiFloatingButtonsBar />
    </PageLayout>
  );
};

export default WikiPage;
