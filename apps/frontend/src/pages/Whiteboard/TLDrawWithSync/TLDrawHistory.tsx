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

import React, { useState } from 'react';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { useTranslation } from 'react-i18next';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import TLDrawHistoryInfiniteList from '@/pages/Whiteboard/TLDrawWithSync/TLDrawHistoryInfiniteList';
import { GoHistory } from 'react-icons/go';
import useMedia from '@/hooks/useMedia';

/*
  TODO:
    - Debug if history is updating accordingly
    - Debug what happens if SSE sent an event -> historyHasMoreItemsToLoad ?
    - Add error boundaries to reload tldraw
    - Read/write room id to browser location
    - Allow teacher to make the room readOnly for students
 */
const TLDrawHistory = () => {
  const { t } = useTranslation();
  const { currentRoomHistory } = useTLDRawHistoryStore();
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
