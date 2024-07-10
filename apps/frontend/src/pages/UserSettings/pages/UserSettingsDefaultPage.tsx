import React from 'react';
import i18n from '@/i18n';

const UserSettingsDefaultPage: React.FC = () => (
  <div className="flex flex-col justify-between">
    <h2>{i18n.t('usersettings.title')}</h2>
    <div className="pt-5 sm:pt-0">
      <p className="pb-4">{i18n.t('usersettings.description')}</p>
    </div>
  </div>
);

export default UserSettingsDefaultPage;
