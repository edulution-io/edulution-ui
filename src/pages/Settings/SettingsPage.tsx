import React from 'react';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="text-white">
      <h1 className="mb-1 text-lg">{t('settings')}</h1>
      <p className="text-lg">
        <input title="Link to Moodle" />
      </p>
      <p className="text-md mt-4">
        Our mission is to empower businesses and individuals with innovative technology that enhances productivity and
        simplifies processes.
      </p>
    </div>
  );
};

export default SettingsPage;
