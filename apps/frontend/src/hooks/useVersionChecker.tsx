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
