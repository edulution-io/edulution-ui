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
import { InfoBoardIcon } from '@/assets/icons';
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
import BULLETIN_BOARD_GRID_ROWS from '@libs/bulletinBoard/constants/bulletin-board-grid-rows';
import useMedia from '@/hooks/useMedia';
import cn from '@libs/common/utils/className';

const BulletinBoardPage = () => {
  const { t } = useTranslation();
  const {
    bulletinBoardNotifications,
    bulletinsByCategories,
    getBulletinsByCategories,
    isLoading,
    isEditorialModeEnabled,
    hydrateCollapsed,
    hydrateGridRows,
    gridRows,
  } = useBulletinBoardStore();
  const { isMobileView } = useMedia();

  const { getUserPreferences } = useUserPreferencesStore();
  const { getCategoriesWithEditPermission } = useBulletinBoardEditorialStore();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const userPreferences = await getUserPreferences([
        USER_PREFERENCES_FIELDS.collapsedBulletins,
        USER_PREFERENCES_FIELDS.bulletinBoardGridRows,
      ] as string[]);

      if (userPreferences?.collapsedBulletins) {
        hydrateCollapsed(userPreferences.collapsedBulletins);
      } else {
        hydrateCollapsed({});
      }

      if (userPreferences?.bulletinBoardGridRows) {
        hydrateGridRows(userPreferences.bulletinBoardGridRows);
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
    hydrateGridRows,
    getBulletinsByCategories,
    getCategoriesWithEditPermission,
  ]);

  const isMultiRow = gridRows !== BULLETIN_BOARD_GRID_ROWS.ONE;
  const isAutoLayout = gridRows === BULLETIN_BOARD_GRID_ROWS.AUTO;

  const getColumnCount = () => {
    if (!isMultiRow || isAutoLayout) return undefined;
    const rowCount = gridRows === BULLETIN_BOARD_GRID_ROWS.TWO ? 2 : 3;
    const categoryCount = bulletinsByCategories?.length ?? 1;
    return Math.max(1, Math.ceil(categoryCount / rowCount));
  };

  const getContainerClassName = () => {
    if (isAutoLayout) {
      return 'grid h-full max-h-full auto-rows-min grid-cols-1 gap-3 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))]';
    }
    if (isMultiRow) {
      return 'grid h-full max-h-full gap-3 overflow-x-auto overflow-y-auto p-3 scrollbar-thin md:overflow-x-hidden';
    }
    return 'flex h-full max-h-full overflow-x-auto overflow-y-hidden scrollbar-thin';
  };

  const getContainerStyle = (): React.CSSProperties | undefined => {
    const cols = getColumnCount();
    if (!cols) return undefined;
    if (isMobileView) {
      return { gridTemplateColumns: `repeat(${cols}, minmax(85vw, 1fr))` };
    }
    return { gridTemplateColumns: `repeat(${cols}, 1fr)` };
  };

  const getPageContent = () => {
    if (isEditorialModeEnabled) {
      return <BulletinBoardEditorialPage />;
    }

    return (
      <div
        className={getContainerClassName()}
        style={getContainerStyle()}
      >
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
                gridRows={gridRows}
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
      hasFullWidthMain={isMobileView}
      nativeAppHeader={{
        title: t('bulletinboard.appTitle'),
        description: t('bulletinboard.description'),
        iconSrc: InfoBoardIcon,
      }}
    >
      <div className={cn('h-full pl-4', isEditorialModeEnabled && 'pr-4')}>{getPageContent()}</div>

      <BulletinBoardEditorialFloatingButtonsBar />
    </PageLayout>
  );
};

export default BulletinBoardPage;
