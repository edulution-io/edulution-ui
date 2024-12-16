import React, { useEffect } from 'react';
import { BLANK_LAYOUT_HEADER_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinBoardPageColumn from '@/pages/BulletinBoard/components/BulletinBoardPageColumn';

const BulletinBoardPage = () => {
  const { bulletinsByCategories, getBulletinsByCategoryNames } = useBulletinBoardStore();

  useEffect(() => {
    void getBulletinsByCategoryNames();
  }, []);

  const pageBarsHeight = useElementHeight([BLANK_LAYOUT_HEADER_ID, FOOTER_ID]) + 15;

  if (!bulletinsByCategories) {
    return null;
  }

  const categoryCount = Object.keys(bulletinsByCategories).length;

  return (
    <div
      style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      className="flex h-full w-full flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin"
    >
      {Object.entries(bulletinsByCategories).map((bulletinsByCategory) => {
        const [categoryName, bulletins] = bulletinsByCategory;
        return (
          <BulletinBoardPageColumn
            key={categoryName}
            categoryCount={categoryCount}
            categoryName={categoryName}
            bulletins={bulletins}
          />
        );
      })}
    </div>
  );
};

export default BulletinBoardPage;
