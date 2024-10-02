import React from 'react';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import CreateButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/createButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

const ConferencesFloatingButtons: React.FC = () => {
  const { openCreateConferenceDialog } = useCreateConferenceDialogStore();
  const { selectedRows, getConferences, setIsDeleteConferencesDialogOpen } = useConferenceStore();
  const selectedConferenceIds = Object.keys(selectedRows);

  const config: FloatingButtonsBarConfig = {
    buttons: [
      DeleteButton(() => setIsDeleteConferencesDialogOpen(true), selectedConferenceIds.length > 0),
      CreateButton(openCreateConferenceDialog),
      ReloadButton(() => {
        void getConferences().catch((e) => console.error(e));
      }),
    ],
    keyPrefix: 'conference-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default ConferencesFloatingButtons;
