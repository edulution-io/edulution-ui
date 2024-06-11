import React from 'react';
import { useTranslation } from 'react-i18next';
import CreateConferenceDialog from '@/pages/ConferencePage/CreateConference/CreateConferenceDialog';
import ConferencesTable from '@/pages/ConferencePage/Table/ConferencesTable';
import FloatingButtonsBar from '@/pages/ConferencePage/Table/FloatingButtonsBar';
import ConferenceDetailsDialog from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialog';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { ConferencesIcon } from '@/assets/icons';
import DeleteConferencesDialog from '@/pages/ConferencePage/Table/DeleteConferencesDialog';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedConference } = useConferenceDetailsDialogStore();

  return (
    <>
      <NativeAppHeader
        title={t('conferences.title')}
        description={t('conferences.description')}
        iconSrc={ConferencesIcon}
      />

      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ConferencesTable />
      </div>

      <FloatingButtonsBar />
      <CreateConferenceDialog />
      <DeleteConferencesDialog />
      {selectedConference ? <ConferenceDetailsDialog /> : null}
    </>
  );
};

export default ConferencePage;
