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
import delay from '@libs/common/utils/delay';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ConferencesFloatingButtons: React.FC = () => {
  const { t } = useTranslation();
  const { openCreateConferenceDialog } = useCreateConferenceDialogStore();
  const { joinConference, setSelectedConference, setJoinConferenceUrl } = useConferenceDetailsDialogStore();
  const { selectedRows, toggleConferenceRunningState, getConferences, setIsDeleteConferencesDialogOpen, conferences } =
    useConferenceStore();
  const selectedConferenceIds = Object.keys(selectedRows);

  const firstSelectedConference = conferences.find((c) => c.meetingID === selectedConferenceIds[0]) || null;
  const isOnlyOneConferenceSelected = selectedConferenceIds.length === 1;

  const startOrStopConference = async () => {
    if (firstSelectedConference) {
      const { meetingID, isRunning } = firstSelectedConference;
      void toggleConferenceRunningState(meetingID, isRunning);
      if (isRunning) {
        void joinConference(meetingID);
      } else {
        setJoinConferenceUrl('');
      }
      await delay(5000);
      await getConferences();
      toast.info(t(`conferences.${isRunning ? 'stopped' : 'started'}`));
    }
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      EditButton(() => setSelectedConference(firstSelectedConference), isOnlyOneConferenceSelected),
      StartButton(
        async () => startOrStopConference(),
        isOnlyOneConferenceSelected && !firstSelectedConference?.isRunning,
      ),
      StopButton(
        async () => startOrStopConference(),
        isOnlyOneConferenceSelected && firstSelectedConference?.isRunning,
      ),
      JoinButton(() => {
        void joinConference(selectedConferenceIds[0]);
      }, isOnlyOneConferenceSelected && firstSelectedConference?.isRunning),
      DeleteButton(() => {
        setIsDeleteConferencesDialogOpen(true);
        setJoinConferenceUrl('');
      }, selectedConferenceIds.length > 0),
      CreateButton(openCreateConferenceDialog),
      ReloadButton(() => {
        void getConferences(false, true);
      }),
    ],
    keyPrefix: 'conference-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default ConferencesFloatingButtons;
