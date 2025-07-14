/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/useCreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import CreateButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/createButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';
import JoinButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/joinButton';
import StartButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/startButton';
import StopButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/stopButton';
import { toast } from 'sonner';
import delay from '@libs/common/utils/delay';

import { useTranslation } from 'react-i18next';

const ConferencesFloatingButtons: React.FC = () => {
  const { t } = useTranslation();
  const { openCreateConferenceDialog } = useCreateConferenceDialogStore();
  const { joinConference, joinConferenceUrl, setSelectedConference, setJoinConferenceUrl } =
    useConferenceDetailsDialogStore();
  const { selectedRows, toggleConferenceRunningState, getConferences, setIsDeleteConferencesDialogOpen, conferences } =
    useConferenceStore();
  const selectedConferenceIds = Object.keys(selectedRows);

  const firstSelectedConference = conferences.find((c) => c.meetingID === selectedConferenceIds[0]) || null;
  const isOnlyOneConferenceSelected = selectedConferenceIds.length === 1;

  const startOrStopConference = async () => {
    if (!firstSelectedConference) return;

    const { meetingID, isRunning } = firstSelectedConference;

    const wasConferenceStateToggled = await toggleConferenceRunningState(meetingID, isRunning);

    if (!isRunning) {
      await joinConference(meetingID);
    } else if (joinConferenceUrl.includes(meetingID)) {
      setJoinConferenceUrl('');
    }

    if (wasConferenceStateToggled) {
      await delay(5000);
      toast.info(t(`conferences.${isRunning ? 'stopped' : 'started'}`));
    } else {
      setJoinConferenceUrl('');
    }

    await getConferences();
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
