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
import StartButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/startButton';
import StopButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/stopButton';

const ConferencesFloatingButtons: React.FC = () => {
  const { openCreateConferenceDialog } = useCreateConferenceDialogStore();
  const { joinConference, setSelectedConference, setJoinConferenceUrl } = useConferenceDetailsDialogStore();
  const { selectedRows, toggleConferenceRunningState, getConferences, setIsDeleteConferencesDialogOpen, conferences } =
    useConferenceStore();
  const selectedConferenceIds = Object.keys(selectedRows);

  const firstSelectedConference = conferences.find((c) => c.meetingID === selectedConferenceIds[0]) || null;
  const isOnlyOneConferenceSelected = selectedConferenceIds.length === 1;

  const config: FloatingButtonsBarConfig = {
    buttons: [
      EditButton(() => setSelectedConference(firstSelectedConference), isOnlyOneConferenceSelected),
      StartButton(() => {
        if (firstSelectedConference) {
          void toggleConferenceRunningState(firstSelectedConference.meetingID, firstSelectedConference.isRunning);
          void joinConference(firstSelectedConference.meetingID);
        }
      }, isOnlyOneConferenceSelected && !firstSelectedConference?.isRunning),
      StopButton(() => {
        if (firstSelectedConference) {
          void toggleConferenceRunningState(firstSelectedConference.meetingID, firstSelectedConference.isRunning);
          setJoinConferenceUrl('');
        }
      }, isOnlyOneConferenceSelected && firstSelectedConference?.isRunning),
      JoinButton(() => {
        void joinConference(selectedConferenceIds[0]);
      }, isOnlyOneConferenceSelected && firstSelectedConference?.isRunning),
      DeleteButton(() => {
        setIsDeleteConferencesDialogOpen(true);
        setJoinConferenceUrl('');
      }, selectedConferenceIds.length > 0),
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
