/* eslint-disable react/no-danger */
import React from 'react';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import cn from '@libs/common/utils/className';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';

const BulletinBoardPageColumn = ({
  bulletins,
  categoryCount,
  categoryName,
}: {
  categoryCount: number;
  categoryName: string;
  bulletins: BulletinResponseDto[];
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn('flex h-full w-1/2 flex-shrink-0 flex-col rounded-lg p-4', {
        'w-1/3': categoryCount === 3,
        'w-[300px]': categoryCount >= 4,
      })}
    >
      <Card
        variant="security"
        className="sticky mb-4 flex items-center justify-between rounded-lg px-3 py-1 opacity-90"
      >
        <h4 className="text-white">{categoryName}</h4>
        <Button
          type="button"
          className="text-white-500 flex h-8 w-8 items-center justify-center rounded-full p-1 hover:bg-blue-600 hover:text-white"
          title={t('common.edit')}
        >
          <PiDotsThreeVerticalBold className="h-12 w-12" />
        </Button>
      </Card>
      <div className="flex flex-col gap-4 overflow-y-auto pb-20 text-white">
        {bulletins.map((bulletin) => (
          <div
            key={bulletin.id}
            className="rounded-lg bg-white bg-opacity-5 p-4"
          >
            <h4>{bulletin.title}</h4>
            <div
              className="mt-3 text-gray-100"
              dangerouslySetInnerHTML={{ __html: bulletin.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulletinBoardPageColumn;
