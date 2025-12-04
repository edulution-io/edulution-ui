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

import React, { useEffect, useState } from 'react';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { BulletinBoardIcon } from '@/assets/icons';
import { useTranslation } from 'react-i18next';
import BulletinBoardEditorialPage from '@/pages/BulletinBoard/BulletinBoardEditorial/BulletinBoardEditorialPage';
import BulletinBoardEditorialFloatingButtonsBar from '@/pages/BulletinBoard/BulletinBoardEditorial/BulletinBoardEditorialFloatingButtonsBar';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import BulletinBoardPageColumn from '@/pages/BulletinBoard/components/BulletinBoardPageColumn';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import PageLayout from '@/components/structure/layout/PageLayout';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoard/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';
import useUserPreferencesStore from '@/store/useUserPreferencesStore';
import USER_PREFERENCES_FIELDS from '@libs/user-preferences/constants/user-preferences-fields';

const BulletinBoardPage = () => {
  const { t } = useTranslation();
  const {
    bulletinBoardNotifications,
    bulletinsByCategories,
    getBulletinsByCategories,
    isLoading,
    isEditorialModeEnabled,
    hydrateCollapsed,
  } = useBulletinBoardStore();

  const { getUserPreferences } = useUserPreferencesStore();
  const { getCategoriesWithEditPermission } = useBulletinBoardEditorialStore();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const userPreferences = await getUserPreferences([USER_PREFERENCES_FIELDS.collapsedBulletins]);

      if (userPreferences?.collapsedBulletins) {
        hydrateCollapsed(userPreferences.collapsedBulletins);
      } else {
        hydrateCollapsed({});
      }

      void getCategoriesWithEditPermission();
      await getBulletinsByCategories(false);
      setIsInitialLoading(false);
    };

    void fetchData();
  }, [
    isEditorialModeEnabled,
    bulletinBoardNotifications,
    getUserPreferences,
    hydrateCollapsed,
    getBulletinsByCategories,
    getCategoriesWithEditPermission,
  ]);

  const getPageContent = () => {
    if (isEditorialModeEnabled) {
      return <BulletinBoardEditorialPage />;
    }

    return (
      <div className="flex h-full max-h-full overflow-x-auto overflow-y-hidden scrollbar-thin">
        {(isLoading || isInitialLoading) && <LoadingIndicatorDialog isOpen />}

        {bulletinsByCategories &&
          bulletinsByCategories
            .sort((a, b) => a.category.position - b.category.position)
            .map(({ bulletins, category, canEditCategory }) => (
              <BulletinBoardPageColumn
                key={category.id}
                categoryCount={bulletinsByCategories.length}
                canEditCategory={canEditCategory}
                category={category}
                bulletins={bulletins}
              />
            ))}

        {!(isLoading || isInitialLoading) && !bulletinsByCategories?.length && (
          <div className="flex h-full min-h-full w-full items-center justify-center">
            <div>{t('bulletinboard.noBulletinsToShow')}</div>
          </div>
        )}

        <CreateOrUpdateBulletinDialog onSubmit={getBulletinsByCategories} />
      </div>
    );
  };

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('bulletinboard.appTitle'),
        description: t('bulletinboard.description'),
        iconSrc: BulletinBoardIcon,
      }}
    >
      {getPageContent()}

      <BulletinBoardEditorialFloatingButtonsBar />
    </PageLayout>
  );
};

export default BulletinBoardPage;
