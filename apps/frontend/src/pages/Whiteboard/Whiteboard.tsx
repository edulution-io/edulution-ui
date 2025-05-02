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

import React, { lazy, Suspense, useMemo } from 'react';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PageLayout from '@/components/structure/layout/PageLayout';
import useLanguage from '@/hooks/useLanguage';
import useUserStore from '@/store/UserStore/UserStore';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import EDU_API_WEBSOCKET_URL from '@libs/common/constants/eduApiWebsocketUrl';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import { useTranslation } from 'react-i18next';

const TldrawWithSync = lazy(() => import('./TLDrawWithSync'));

const Whiteboard = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { user } = useUserStore();

  const WS_BASE_URL = `${EDU_API_WEBSOCKET_URL}/${TLDRAW_SYNC_ENDPOINTS.BASE}`;

  const roomId = user?.username;

  const uri = useMemo(() => `${WS_BASE_URL}?${ROOM_ID_PARAM}=${roomId}`, [roomId]);

  return (
    <PageLayout isFullScreen>
      <Suspense fallback={<CircleLoader className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />}>
        <TldrawWithSync
          uri={uri}
          userLanguage={language}
          userName={user?.lastName ?? t('common.guest')}
        />
      </Suspense>
    </PageLayout>
  );
};

export default Whiteboard;
