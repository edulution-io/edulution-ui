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

import React, { useEffect, useRef } from 'react';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { useTranslation } from 'react-i18next';
import HistoryEntryDto from '@libs/whiteboard/types/historyEntryDto';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import { MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';

const TLDrawHistoryInfiniteList: React.FC = () => {
  const { t } = useTranslation();
  const { currentRoomHistory, isHistoryLoading, historyHasMoreItemsToLoad, fetchNextHistoryPage } =
    useTLDRawHistoryStore();
  const { currentWindowedFrameSizes } = useFrameStore();
  const height =
    (currentWindowedFrameSizes['whiteboard-collaboration.historyTitle']?.height || 150) - MAXIMIZED_BAR_HEIGHT;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const container = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;

    if (historyHasMoreItemsToLoad && container && sentinel) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            void fetchNextHistoryPage(5);
          }
        },
        {
          root: container,
          rootMargin: '0px',
          threshold: 0.5,
        },
      );
      observer.observe(sentinel);
    }

    return () => {
      observer?.disconnect();
    };
  }, [historyHasMoreItemsToLoad, fetchNextHistoryPage]);

  if (isHistoryLoading && currentRoomHistory?.page === 1) {
    return (
      <div className="flex h-full items-center justify-center">
        <CircleLoader />
      </div>
    );
  }

  const items = currentRoomHistory?.items || [];

  if (!items.length) return null;

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollContainerRef}
        className="divide-y divide-slate-500 overflow-y-auto"
        style={{ height }}
      >
        <ul>
          {items.map((entry: HistoryEntryDto) => (
            <li
              key={entry.id}
              className="flex flex-row items-center justify-between px-2 py-1 hover:bg-muted"
            >
              <div className="flex flex-1 space-x-2">
                <span className="font-medium">
                  {entry.attendee.firstName} {entry.attendee.lastName}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleTimeString()}</div>
            </li>
          ))}
        </ul>

        <div
          ref={loadMoreRef}
          className="h-4"
        />

        {isHistoryLoading && (
          <div className="flex justify-center py-2">
            <CircleLoader />
          </div>
        )}

        {!historyHasMoreItemsToLoad && (
          <div className="py-2 text-center text-sm text-muted-foreground">
            {t('whiteboard-collaboration.historyNoMore')}
          </div>
        )}
      </div>
    </div>
  );
};

export default TLDrawHistoryInfiniteList;
