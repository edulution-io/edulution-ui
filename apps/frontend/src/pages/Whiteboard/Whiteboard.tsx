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
import SaveExternalFileDialog from '@/pages/FileSharing/Dialog/SaveExternalFileDialog';
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
    if (fromUrl && fromUrl !== selectedRoomId) {
      setSelectedRoomId(fromUrl);
    }
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
    <PageLayout isFullScreen>
      <Suspense fallback={loader}>
        <div className="z-0 h-full w-full">{getPageContent()}</div>
      </Suspense>
      <SaveExternalFileDialog />
      <FileSelectorDialog />
    </PageLayout>
  );
};

export default Whiteboard;
