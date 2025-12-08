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

import React, { useEffect, useRef } from 'react';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { useTranslation } from 'react-i18next';
import HistoryEntryDto from '@libs/whiteboard/types/historyEntryDto';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import { MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';

const TLDrawHistoryInfiniteList: React.FC = () => {
  const { t } = useTranslation();
  const currentRoomHistory = useTLDRawHistoryStore((s) => s.currentRoomHistory);
  const isHistoryLoading = useTLDRawHistoryStore((s) => s.isHistoryLoading);
  const historyHasMoreItemsToLoad = useTLDRawHistoryStore((s) => s.historyHasMoreItemsToLoad);
  const fetchNextHistoryPage = useTLDRawHistoryStore((s) => s.fetchNextHistoryPage);
  const { currentWindowedFrameSizes } = useFrameStore();
  const height =
    (currentWindowedFrameSizes['whiteboard-collaboration.historyTitle']?.height || 150) - MAXIMIZED_BAR_HEIGHT;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;
    if (!container || !sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && historyHasMoreItemsToLoad && !isHistoryLoading) {
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
    return () => observer.disconnect();
  }, [fetchNextHistoryPage, historyHasMoreItemsToLoad, isHistoryLoading]);

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
              className="flex cursor-default flex-row items-center justify-between px-2 py-1 hover:bg-muted"
            >
              <div className="flex flex-1 space-x-2">
                <span className="font-medium">
                  {entry.attendee.firstName} {entry.attendee.lastName}
                </span>
              </div>
              <div className="group relative text-xs text-muted-foreground">
                <span className="group-hover:hidden">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                <span className="hidden group-hover:inline">{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
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
