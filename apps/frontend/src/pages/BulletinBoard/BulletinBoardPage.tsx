import React from 'react';
import { BLANK_LAYOUT_HEADER_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinBoardPageColumn from '@/pages/BulletinBoard/components/BulletinBoardPageColumn';

const BulletinBoardPage = () => {
  const { bulletinsByCategories } = useBulletinBoardStore();
  const pageBarsHeight = useElementHeight([BLANK_LAYOUT_HEADER_ID, FOOTER_ID]) + 15;

  return (
    <div
      style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      className="flex h-full w-full flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin"
    >
      {bulletinsByCategories?.map(({ bulletins, category }) => (
        <BulletinBoardPageColumn
          key={category.id}
          categoryCount={bulletinsByCategories.length}
          category={category}
          bulletins={bulletins}
        />
      ))}
    </div>
  );
};

export default BulletinBoardPage;
