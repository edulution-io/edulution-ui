import React from 'react';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import CreateButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/createButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import JoinButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/joinButton';
import { toast } from 'sonner';
import i18n from '@/i18n';

const ConferencesFloatingButtons: React.FC = () => {
  const { openCreateConferenceDialog } = useCreateConferenceDialogStore();
  const { joinConference, setSelectedConference } = useConferenceDetailsDialogStore();
  const { selectedRows, getConferences, setIsDeleteConferencesDialogOpen, conferences } = useConferenceStore();
  const selectedConferenceIds = Object.keys(selectedRows);

  const firstSelectedConference = conferences.find((c) => c.meetingID === selectedConferenceIds[0]) || null;

  const config: FloatingButtonsBarConfig = {
    buttons: [
      EditButton(() => setSelectedConference(firstSelectedConference), selectedConferenceIds.length === 1),
      JoinButton(
        () => {
          void joinConference(selectedConferenceIds[0]);
        },
        !!(firstSelectedConference?.isRunning && selectedConferenceIds.length === 1),
      ),
      DeleteButton(() => setIsDeleteConferencesDialogOpen(true), selectedConferenceIds.length > 0),
      CreateButton(openCreateConferenceDialog),
      ReloadButton(() => {
        getConferences()
          .then(() => toast.success(i18n.t('conferences.conferenceFetchedSuccessfully')))
          .catch((e) => console.error(e));
      }),
    ],
    keyPrefix: 'conference-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default ConferencesFloatingButtons;
