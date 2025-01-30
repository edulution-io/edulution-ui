import React from 'react';
import { BLANK_LAYOUT_HEADER_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinBoardPageColumn from '@/pages/BulletinBoard/components/BulletinBoardPageColumn';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APPS from '@libs/appconfig/constants/apps';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';

const BulletinBoardPage = () => {
  const { bulletinsByCategories } = useBulletinBoardStore();
  const { appConfigs } = useAppConfigsStore();

  const bulletinBoardConfig = findAppConfigByName(appConfigs, APPS.BULLETIN_BOARD);
  const pageBarsHeight = useElementHeight([BLANK_LAYOUT_HEADER_ID, FOOTER_ID]) + 15;

  return (
    <div
      style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      className="flex h-full w-full flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin"
    >
      {bulletinsByCategories
        ?.sort((a, b) => a.category.position - b.category.position)
        .map(({ bulletins, category, canEditCategory }) => (
          <BulletinBoardPageColumn
            key={category.id}
            categoryCount={bulletinsByCategories.length}
            canEditCategory={canEditCategory}
            category={category}
            bulletins={bulletins}
            canManageBulletins={!!bulletinBoardConfig}
          />
        ))}
    </div>
  );
};

export default BulletinBoardPage;
