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

import React, { useEffect, useState } from 'react';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { BulletinBoardIcon } from '@/assets/icons';
import { useTranslation } from 'react-i18next';
import BulletinBoardEditorialPage from '@/pages/BulletinBoard/BulletinBoardEditorial/BulletinBoardEditorialPage';
import BulletinBoardEditorialFloatingButtonsBar from '@/pages/BulletinBoard/BulletinBoardEditorial/BulletinBoardEditorialFloatingButtonsBar';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import BulletinBoardPageColumn from '@/pages/BulletinBoard/components/BulletinBoardPageColumn';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';

const BulletinBoardPage = () => {
  const { t } = useTranslation();
  const {
    bulletinBoardNotifications,
    bulletinsByCategories,
    getBulletinsByCategories,
    isLoading,
    isEditorialModeEnabled,
  } = useBulletinBoardStore();
  const { getCategoriesWithEditPermission } = useBulletinBoardEditorialStore();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const pageBarsHeight = useElementHeight([NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) + 15;

  useEffect(() => {
    void getBulletinsByCategories(false);
    void getCategoriesWithEditPermission();
    setIsInitialLoading(false);
  }, [isEditorialModeEnabled, bulletinBoardNotifications]);

  if (isLoading || isInitialLoading) {
    return <LoadingIndicatorDialog isOpen />;
  }

  const getPageContent = () => {
    if (isEditorialModeEnabled) {
      return <BulletinBoardEditorialPage />;
    }

    return (
      <div
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
        className="flex h-full w-full flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin"
      >
        {bulletinsByCategories?.length ? (
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
            ))
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div>{t('bulletinboard.noBulletinsToShow')}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <NativeAppHeader
        title={t('bulletinboard.appTitle')}
        description={t('bulletinboard.description')}
        iconSrc={BulletinBoardIcon}
      />

      {getPageContent()}

      <BulletinBoardEditorialFloatingButtonsBar />
    </>
  );
};

export default BulletinBoardPage;
