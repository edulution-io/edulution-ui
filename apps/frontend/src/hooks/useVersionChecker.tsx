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

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSseStore from '@/store/useSseStore';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { GrUpgrade } from 'react-icons/gr';
import { useTranslation } from 'react-i18next';
import APPLICATION_NAME from '@libs/common/constants/applicationName';

const useVersionChecker = () => {
  const currentVersion = useRef<string>(String(APP_VERSION));
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const { eventSource } = useSseStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (!eventSource) {
      return undefined;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const handleNewVersion = (event: MessageEvent) => {
      try {
        const { version } = JSON.parse((event as { data: string }).data) as { version: string };

        if (version !== currentVersion.current) {
          setHasNewVersion(true);
        }
      } catch {
        console.error('Error setting new version');
      }
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.PING, handleNewVersion, { signal });

    return () => {
      controller.abort();
      setHasNewVersion(false);
    };
  }, [eventSource]);

  useEffect(() => {
    if (hasNewVersion) {
      toast.info(t('version.newVersionAvailable', { appName: APPLICATION_NAME }), {
        id: `version-${currentVersion.current}`,
        duration: Infinity,
        position: 'top-right',
        icon: <GrUpgrade color="green" />,
        action: {
          label: t('version.update'),
          onClick: () => window.location.reload(),
        },
        onDismiss: () => setHasNewVersion(false),
      });
    }
  }, [hasNewVersion]);
};

export default useVersionChecker;
