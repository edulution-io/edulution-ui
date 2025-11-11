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

import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PageLayout from '@/components/structure/layout/PageLayout';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import EDU_API_WEBSOCKET_URL from '@libs/common/constants/eduApiWebsocketUrl';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/tLDrawSyncEndpoints';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import SaveTldrDialog from '@/pages/Whiteboard/SaveTldrDialog';
import FileSelectorDialog from '@/pages/FileSharing/Dialog/FileSelectorDialog';

const WS_BASE_URL = `${EDU_API_WEBSOCKET_URL}/${TLDRAW_SYNC_ENDPOINTS.BASE}`;

const TLDrawWithSync = lazy(() => import('./TLDrawWithSync/TLDrawWithSync'));
const TlDrawOffline = lazy(() => import('./TLDrawOffline/TLDrawOffline'));

const Whiteboard = () => {
  const getIsEduApiHealthy = useEduApiStore((s) => s.getIsEduApiHealthy);
  const isEduApiHealthy = useEduApiStore((s) => s.isEduApiHealthy);

  const liveToken = useUserStore((s) => s.eduApiToken);

  const selectedRoomId = useTLDRawHistoryStore((s) => s.selectedRoomId);
  const setSelectedRoomId = useTLDRawHistoryStore((s) => s.setSelectedRoomId);

  const [searchParams, setSearchParams] = useSearchParams();
  const [fixedToken, setFixedToken] = useState<string | null>(liveToken ?? null);

  useEffect(() => {
    const fromUrl = searchParams.get(ROOM_ID_PARAM) ?? '';
    if (fromUrl && fromUrl !== selectedRoomId) setSelectedRoomId(fromUrl);
    void getIsEduApiHealthy();
  }, []);

  useEffect(() => {
    if (!fixedToken && liveToken) setFixedToken(liveToken);
  }, [fixedToken, liveToken]);

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    const current = currentParams.get(ROOM_ID_PARAM) ?? '';
    if ((selectedRoomId ?? '') === current) return;
    if (selectedRoomId) currentParams.set(ROOM_ID_PARAM, selectedRoomId);
    else currentParams.delete(ROOM_ID_PARAM);
    setSearchParams(currentParams, { replace: current !== '' });
  }, [selectedRoomId, setSearchParams]);

  const loader = <CircleLoader className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />;

  const uri = useMemo(() => {
    if (!fixedToken) return null;
    const params = new URLSearchParams({ token: fixedToken });
    if (selectedRoomId) params.set(ROOM_ID_PARAM, selectedRoomId);
    return `${WS_BASE_URL}?${params.toString()}`;
  }, [fixedToken, selectedRoomId]);

  const getPageContent = () => {
    if (isEduApiHealthy === undefined) return loader;
    if (!isEduApiHealthy) return <TlDrawOffline />;
    if (!uri) return loader;
    return <TLDrawWithSync uri={uri} />;
  };

  return (
    <PageLayout isFullScreenAppWithoutFloatingButtons>
      <Suspense fallback={loader}>
        <div className="z-0 h-full w-full">{getPageContent()}</div>
      </Suspense>
      <SaveTldrDialog />
      <FileSelectorDialog />
    </PageLayout>
  );
};

export default Whiteboard;
