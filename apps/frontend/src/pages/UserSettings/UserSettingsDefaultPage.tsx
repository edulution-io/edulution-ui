import React from 'react';
import { useTranslation } from 'react-i18next';

const UserSettingsDefaultPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-between">
      <h2>{t('usersettings.title')}</h2>
      <div className="pt-5 sm:pt-0">
        <p className="pb-4">{t('usersettings.description')}</p>
      </div>
    </div>
  );
};

export default UserSettingsDefaultPage;
