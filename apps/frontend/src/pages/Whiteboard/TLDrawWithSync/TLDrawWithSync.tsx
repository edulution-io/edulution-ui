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

import React, { useEffect, useMemo } from 'react';
import { Editor, TLAssetStore, Tldraw, TLImageShapeProps } from 'tldraw';
import { useSync } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import COLOR_SCHEME from '@libs/ui/constants/colorScheme';
import eduApi from '@/api/eduApi';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import useUserStore from '@/store/UserStore/useUserStore';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import handleApiError from '@/utils/handleApiError';
import useLanguage from '@/hooks/useLanguage';
import EDU_API_WEBSOCKET_URL from '@libs/common/constants/eduApiWebsocketUrl';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import { DropdownSelect } from '@/components';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import { useTranslation } from 'react-i18next';
import TLDrawHistory from '@/pages/Whiteboard/TLDrawWithSync/TLDrawHistory';

const TLDrawWithSync = () => {
  const { t } = useTranslation();
  const { user, eduApiToken } = useUserStore();
  const { user: lmnApiUser, getOwnUser } = useLmnApiStore();
  const { language } = useLanguage();
  const { setSelectedRoomId, selectedRoomId, initRoomHistory } = useTLDRawHistoryStore();

  const WS_BASE_URL = `${EDU_API_WEBSOCKET_URL}/${TLDRAW_SYNC_ENDPOINTS.BASE}`;
  const assetBasePath = `/${TLDRAW_SYNC_ENDPOINTS.BASE}/${TLDRAW_SYNC_ENDPOINTS.ASSETS}`;

  useEffect(() => {
    void getOwnUser();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      void initRoomHistory(selectedRoomId, 5);
    }
  }, [selectedRoomId, initRoomHistory]);

  const uri = useMemo(() => {
    const params = new URLSearchParams({ token: eduApiToken });

    if (selectedRoomId) {
      params.set(ROOM_ID_PARAM, selectedRoomId);
    }

    return `${WS_BASE_URL}?${params.toString()}`;
  }, [selectedRoomId, eduApiToken]);

  const assetStore = useMemo<TLAssetStore>(
    () => ({
      async upload(asset, file) {
        const filename = `${user?.username}_${asset.id}`;

        const form = new FormData();
        form.append('file', file, filename);

        const assetPath = `${assetBasePath}/${encodeURIComponent(filename)}`;

        await eduApi.post<string>(assetPath, form, {
          headers: {
            [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA,
          },
        });

        const url = `${EDU_API_URL}${assetPath}`;

        return { src: url, meta: { url } };
      },

      resolve(asset) {
        return asset.props.src;
      },
    }),
    [user?.username],
  );

  if (!user) return null;

  const applyUserPreferences = (editor: Editor) => {
    editor.user.updateUserPreferences({
      colorScheme: COLOR_SCHEME,
      locale: language,
      name: `${user.firstName} ${user.lastName}(${user.username})`,
    });
  };

  const registerAssetHandler = (editor: Editor) => {
    editor.sideEffects.registerAfterChangeHandler('asset', (prev, next) => {
      if (prev.props.src || !next.props.src) return;

      const url = next.props.src;

      const shapes = editor
        .getCurrentPageShapes()
        .filter(
          (s) => (s.type === 'image' || s.type === 'video') && (s.props as TLImageShapeProps).assetId === next.id,
        );

      editor.updateShapes(
        shapes.map((shape) => ({
          id: shape.id,
          type: shape.type,
          props: {
            ...(shape.props as TLImageShapeProps),
            url,
          },
        })),
      );
    });
  };

  const registerDeleteHandler = (editor: Editor) => {
    editor.sideEffects.registerAfterDeleteHandler('shape', (shape, source) => {
      if (shape.type !== 'image' && shape.type !== 'video') return;

      const { url, assetId } = shape.props as TLImageShapeProps;
      const fileName = decodeURIComponent(url.split('/').pop()!);

      if (assetId) {
        editor.deleteAssets([assetId]);
      }

      if (source !== 'user' || !assetId) return;

      const stillUsed = editor
        .getCurrentPageShapes()
        .some((s) => (s.type === 'image' || s.type === 'video') && (s.props as TLImageShapeProps).assetId === assetId);

      if (stillUsed) return;

      void eduApi
        .delete(`${assetBasePath}/${encodeURIComponent(fileName)}`)
        .catch((err) => handleApiError(err, () => {}));
    });
  };

  const store = useSync({ uri, assets: assetStore });

  const projects =
    lmnApiUser?.projects?.map((p) => ({ id: p, name: removeSchoolPrefix(p, `p_${lmnApiUser.school}`) })) || [];
  const schoolClasses =
    lmnApiUser?.schoolclasses?.map((c) => ({ id: c, name: removeSchoolPrefix(c, lmnApiUser.school) })) || [];
  const sessions =
    lmnApiUser?.lmnsessions?.map((s) => ({ id: s.sid, name: removeSchoolPrefix(s.name, `p_${lmnApiUser.school}`) })) ||
    [];
  const roomIdOptions = [...projects, ...schoolClasses, ...sessions];

  return (
    <div className="flex h-full flex-col">
      <DropdownSelect
        placeholder={t('whiteboard-collaboration.dropdownPlaceholder')}
        options={[{ id: '', name: 'whiteboard-collaboration.privateRoom' }].concat(roomIdOptions)}
        selectedVal={selectedRoomId}
        handleChange={setSelectedRoomId}
        variant="default"
        classname="z-[400]"
      />

      {selectedRoomId && <TLDrawHistory />}

      <Tldraw
        className="z-10"
        onMount={(editor) => {
          applyUserPreferences(editor);
          registerAssetHandler(editor);
          registerDeleteHandler(editor);
        }}
        store={store}
      />
    </div>
  );
};

export default TLDrawWithSync;
