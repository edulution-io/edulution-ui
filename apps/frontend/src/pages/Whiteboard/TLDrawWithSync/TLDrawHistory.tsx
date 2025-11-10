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

import React, { useState } from 'react';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { useTranslation } from 'react-i18next';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import TLDrawHistoryInfiniteList from '@/pages/Whiteboard/TLDrawWithSync/TLDrawHistoryInfiniteList';
import { GoHistory } from 'react-icons/go';
import useMedia from '@/hooks/useMedia';

const TLDrawHistory = () => {
  const { t } = useTranslation();
  const currentRoomHistory = useTLDRawHistoryStore((s) => s.currentRoomHistory);
  const [isOpen, setIsOpen] = useState(false);
  const { isMobileView } = useMedia();

  const className = 'absolute top-[40px] rounded-b-lg bg-ciDarkGreyDisabled text-muted-foreground z-[11] h-[40px]';

  if (currentRoomHistory === null)
    return (
      <div className={className}>
        <CircleLoader className="m-auto" />
      </div>
    );

  if (!currentRoomHistory || !currentRoomHistory.items.length) return null;

  return (
    <div
      className={className}
      style={{ left: isMobileView ? 166 : 347 }}
    >
      <button
        type="button"
        className="m-[4px] flex flex-row items-center space-x-2 rounded-lg p-[6px] hover:bg-secondary-foreground"
        onClick={() => setIsOpen(true)}
      >
        <GoHistory /> <span>{t('whiteboard-collaboration.historyTitle')}</span>
      </button>

      {isOpen && (
        <ResizableWindow
          initialPosition={{ x: isMobileView ? 40 : 270, y: 40 }}
          initialSize={{ height: 150, width: 300 }}
          minimalSize={{ height: 100 }}
          disableToggleMaximizeWindow
          openMaximized={false}
          titleTranslationId="whiteboard-collaboration.historyTitle"
          handleClose={() => setIsOpen(false)}
        >
          <TLDrawHistoryInfiniteList />
        </ResizableWindow>
      )}
    </div>
  );
};

export default TLDrawHistory;
