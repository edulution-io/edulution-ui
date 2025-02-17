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

import React, { useEffect } from 'react';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APPS from '@libs/appconfig/constants/apps';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { BulletinBoardIcon } from '@/assets/icons';
import { useTranslation } from 'react-i18next';
import BulletinBoardEditorialPage from '@/pages/BulletinBoard/BulletinBoardEditorial/BulletinBoardEditorialPage';
import BulletinBoardEditorialFloatingButtonsBar from '@/pages/BulletinBoard/BulletinBoardEditorial/BulletinBoardEditorialFloatingButtonsBar';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import BulletinBoardPageColumn from '@/pages/BulletinBoard/components/BulletinBoardPageColumn';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';

const BulletinBoardPage = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { bulletinsByCategories, getBulletinsByCategories, isLoading, isEditorialModeEnabled } =
    useBulletinBoardStore();
  const { getCategoriesWithEditPermission } = useBulletinBoardEditorialStore();

  const bulletinBoardConfig = findAppConfigByName(appConfigs, APPS.BULLETIN_BOARD);
  const pageBarsHeight = useElementHeight([NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) + 15;

  useEffect(() => {
    void getBulletinsByCategories();
    void getCategoriesWithEditPermission();
  }, [isEditorialModeEnabled]);

  if (isLoading) {
    return <LoadingIndicator isOpen />;
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
                canManageBulletins={!!bulletinBoardConfig}
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
