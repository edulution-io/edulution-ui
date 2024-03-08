import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div>
      <h1 className="mb-1 text-lg">{t('conferences.title')}</h1>
      <iframe
        title={location.pathname}
        src="http://localhost:5173/"
      />
    </div>
  );
};

export default ConferencePage;
