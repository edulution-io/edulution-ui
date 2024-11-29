import React from 'react';
import { useTranslation } from 'react-i18next';

const BulletinBoardEditorPage = () => {
  const { t } = useTranslation();

  return <div>{t('here comes the filter and table to manage bulletins')}</div>;
};

export default BulletinBoardEditorPage;
