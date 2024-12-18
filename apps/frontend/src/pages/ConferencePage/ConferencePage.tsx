import React from 'react';
import { useTranslation } from 'react-i18next';
import CreateConferenceDialog from '@/pages/ConferencePage/CreateConference/CreateConferenceDialog';
import ConferencesTable from '@/pages/ConferencePage/Table/ConferencesTable';
import ConferenceDetailsDialog from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialog';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { ConferencesIcon } from '@/assets/icons';
import DeleteConferencesDialog from '@/pages/ConferencePage/Table/DeleteConferencesDialog';
import ConferencesFloatingButtons from '@/pages/ConferencePage/Table/ConferencesFloatingButtons';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedConference } = useConferenceDetailsDialogStore();

  return (
    <div>
      <NativeAppHeader
        title={t('conferences.title')}
        description={t('conferences.description')}
        iconSrc={ConferencesIcon}
      />

      <ConferencesTable />

      <ConferencesFloatingButtons />
      <CreateConferenceDialog />
      <DeleteConferencesDialog />
      {selectedConference ? <ConferenceDetailsDialog /> : null}
    </div>
  );
};

export default ConferencePage;
