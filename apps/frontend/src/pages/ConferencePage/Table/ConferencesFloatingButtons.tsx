/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
