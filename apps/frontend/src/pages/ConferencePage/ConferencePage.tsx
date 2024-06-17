import React from 'react';
import { useTranslation } from 'react-i18next';
import CreateConferenceDialog from '@/pages/ConferencePage/CreateConference/CreateConferenceDialog';
import ConferencesTable from '@/pages/ConferencePage/Table/ConferencesTable';
import FloatingButtonsBar from '@/pages/ConferencePage/Table/FloatingButtonsBar';
import ConferenceDetailsDialog from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialog';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedConference } = useConferenceDetailsDialogStore();

  return (
    <div className="p-5 lg:pr-20">
      <h1 className="mb-1 text-lg">{t('conferences.title')}</h1>

      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ConferencesTable />
      </div>

      <FloatingButtonsBar />
      <CreateConferenceDialog />
      {selectedConference ? <ConferenceDetailsDialog /> : null}
    </div>
  );
};

export default ConferencePage;
