import React from 'react';
import { useTranslation } from 'react-i18next';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="mb-1 text-lg">{t('conferences.title')}</h1>
    </div>
  );
};

export default ConferencePage;
