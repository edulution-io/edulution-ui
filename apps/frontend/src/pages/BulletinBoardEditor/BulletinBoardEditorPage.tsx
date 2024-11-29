import React from 'react';
import { useTranslation } from 'react-i18next';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { BulletinBoardIcon } from '@/assets/icons';

const BulletinBoardEditorPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-5 lg:pr-20">
      <NativeAppHeader
        title={t('bulletinBoard.title')}
        description={t('bulletinBoard.description')}
        iconSrc={BulletinBoardIcon}
      />

      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <div>{t('here comes the filter and table to manage bulletins')}</div>
      </div>

      {/* <FloatingButtons/> */}
      {/* <Dialog/> */}
    </div>
  );
};

export default BulletinBoardEditorPage;
