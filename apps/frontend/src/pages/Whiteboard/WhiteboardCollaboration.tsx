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
import COLOR_SCHEME from '@libs/ui/constants/colorScheme';
import { Editor, TLAssetStore } from 'tldraw';
import { useSync } from '@tldraw/sync';
import useUserStore from '@/store/UserStore/UserStore';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import EDU_API_WEBSOCKET_URL from '@libs/common/constants/eduApiWebsocketUrl';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';

const TLDraw = lazy(() =>
  Promise.all([import('tldraw'), import('tldraw/tldraw.css')]).then(([module]) => ({
    default: module.Tldraw,
  })),
);

const WhiteboardCollaboration = () => {
  const { language } = useLanguage();
  const { user } = useUserStore();

  const handleMount = (editor: Editor) => {
    editor.user.updateUserPreferences({ colorScheme: COLOR_SCHEME, locale: language, name: user?.lastName });
  };

  const WS_BASE_URL = `${EDU_API_WEBSOCKET_URL}/${TLDRAW_SYNC_ENDPOINTS.BASE}`;
  const roomId = user?.username;

  const uri = useMemo(() => `${WS_BASE_URL}?${ROOM_ID_PARAM}=${roomId}`, [roomId]);

  const myAssetStore = useMemo<TLAssetStore>(
    () => ({
      upload() {
        throw new Error('Asset uploads are disabled.');
      },
      resolve(asset) {
        return asset.props.src;
      },
    }),
    [],
  );

  const store = useSync({ uri, assets: myAssetStore });

  return (
    <PageLayout isFullScreen>
      <Suspense fallback={<CircleLoader className="m-auto" />}>
        <TLDraw
          onMount={handleMount}
          store={store}
          overrides={{
            actions(_editor, actions) {
              // eslint-disable-next-line no-param-reassign
              delete actions['insert-media'];
              return actions;
            },
            tools(_editor, tools) {
              // eslint-disable-next-line no-param-reassign
              delete tools.asset;
              return tools;
            },
          }}
        />
      </Suspense>
    </PageLayout>
  );
};

export default WhiteboardCollaboration;
