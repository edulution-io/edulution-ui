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

import React, { useEffect, useMemo, useRef } from 'react';
import { Editor, TLAssetStore, Tldraw, TLImageShapeProps } from 'tldraw';
import { useSync } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import COLOR_SCHEME from '@libs/ui/constants/colorScheme';
import eduApi from '@/api/eduApi';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import useUserStore from '@/store/UserStore/useUserStore';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/tLDrawSyncEndpoints';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import handleApiError from '@/utils/handleApiError';
import useLanguage from '@/hooks/useLanguage';
import { DropdownSelect } from '@/components';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import { useTranslation } from 'react-i18next';
import TLDrawHistory from '@/pages/Whiteboard/TLDrawWithSync/TLDrawHistory';
import tlDrawComponents from '@/pages/Whiteboard/components/tlDrawComponents';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';

const TLDrawWithSync = ({ uri }: { uri: string }) => {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const usernameRef = useRef(user?.username ?? 'guest');

  useEffect(() => {
    usernameRef.current = user?.username ?? 'guest';
  }, [user?.username]);

  const lmnApiUser = useLmnApiStore((s) => s.user);
  const getOwnUser = useLmnApiStore((s) => s.getOwnUser);
  const { language } = useLanguage();
  const selectedRoomId = useTLDRawHistoryStore((s) => s.selectedRoomId);
  const setSelectedRoomId = useTLDRawHistoryStore((s) => s.setSelectedRoomId);
  const initRoomHistory = useTLDRawHistoryStore((s) => s.initRoomHistory);

  useEffect(() => {
    if (!user) {
      void getOwnUser();
    }
  }, []);

  const assetBasePath = `/${TLDRAW_SYNC_ENDPOINTS.BASE}/${TLDRAW_SYNC_ENDPOINTS.ASSETS}`;

  const assetStore = useMemo<TLAssetStore>(
    () => ({
      async upload(asset, file) {
        const filename = `${usernameRef.current}_${asset.id}`;
        const form = new FormData();
        form.append('file', file, filename);
        const assetPath = `${assetBasePath}/${encodeURIComponent(filename)}`;
        await eduApi.post<string>(assetPath, form, {
          headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
        });
        const url = `${EDU_API_URL}${assetPath}`;
        return { src: url, meta: { url } };
      },
      resolve(asset) {
        return asset.props.src;
      },
    }),
    [assetBasePath],
  );

  const store = useSync({ uri, assets: assetStore });

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

  useEffect(() => {
    if (!selectedRoomId) return;
    void initRoomHistory(selectedRoomId, 5);
  }, [selectedRoomId, initRoomHistory]);

  const roomIdOptions = useMemo(() => {
    const projects =
      lmnApiUser?.projects?.map((p) => ({ id: p, name: removeSchoolPrefix(p, `p_${lmnApiUser.school}`) })) || [];
    const schoolClasses =
      lmnApiUser?.schoolclasses?.map((c) => ({ id: c, name: removeSchoolPrefix(c, lmnApiUser.school) })) || [];
    return [...projects, ...schoolClasses];
  }, [lmnApiUser?.projects, lmnApiUser?.schoolclasses, lmnApiUser?.school]);

  if (!user) return null;

  const applyUserPreferences = (editor: Editor) => {
    editor.user.updateUserPreferences({
      colorScheme: COLOR_SCHEME,
      locale: language,
      name: `${user.firstName} ${user.lastName}(${user.username})`,
    });
  };

  const { setEditor } = useWhiteboardEditorStore();

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

      {uri && store && (
        <Tldraw
          className="z-100"
          onMount={(editor) => {
            setEditor(editor);
            applyUserPreferences(editor);
            registerAssetHandler(editor);
            registerDeleteHandler(editor);
          }}
          store={store}
          components={tlDrawComponents}
        />
      )}
    </div>
  );
};

export default TLDrawWithSync;
