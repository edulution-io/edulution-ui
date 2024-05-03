import React from 'react';
import { useTranslation } from 'react-i18next';
import CreateConferenceDialog from '@/pages/ConferencePage/CreateConference/CreateConferenceDialog';
import ConferencesTable from '@/pages/ConferencePage/Table/ConferencesTable';
import FloatingButtonsBar from '@/pages/ConferencePage/Table/FloatingButtonsBar';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="mb-1 text-lg">{t('conferences.title')}</h1>

      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ConferencesTable />
      </div>

      <FloatingButtonsBar />
      <CreateConferenceDialog />
    </>
  );
};

export default ConferencePage;
