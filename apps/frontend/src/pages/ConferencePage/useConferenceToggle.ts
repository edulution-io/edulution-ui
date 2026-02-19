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

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import delay from '@libs/common/utils/delay';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';

const TOAST_DELAY_MS = 5000;

const useConferenceToggle = () => {
  const { t } = useTranslation();
  const { toggleConferenceRunningState, getConferences } = useConferenceStore();
  const { joinConference, joinConferenceUrl, setJoinConferenceUrl } = useConferenceDetailsDialogStore();

  const toggleAndHandleJoinConference = useCallback(
    async (meetingID: string, isRunning: boolean) => {
      const wasConferenceStateToggled = await toggleConferenceRunningState(meetingID, isRunning);

      if (!isRunning) {
        await joinConference(meetingID);
      } else if (joinConferenceUrl.includes(meetingID)) {
        setJoinConferenceUrl('');
      }

      if (wasConferenceStateToggled) {
        await delay(TOAST_DELAY_MS);
        toast.info(t(`conferences.${isRunning ? 'stopped' : 'started'}`));
      } else {
        setJoinConferenceUrl('');
      }

      await getConferences();
    },
    [toggleConferenceRunningState, joinConference, joinConferenceUrl, setJoinConferenceUrl, getConferences, t],
  );

  return { toggleAndHandleJoinConference };
};

export default useConferenceToggle;
