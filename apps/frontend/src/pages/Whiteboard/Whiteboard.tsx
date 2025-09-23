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
import SaveExternalFileDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/SaveExternalFileDialogBody';
import saveExternalFileFormSchema from '@libs/filesharing/types/saveExternalFileFormSchema';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import buildTldrFileFromEditor from '@libs/tldraw-sync/utils/buildTldrFileFromEditor';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import SaveExternalFileDialogGeneric from '@/pages/FileSharing/Dialog/SaveExternalFileDialogGeneric';
import { useTranslation } from 'react-i18next';
import FileSelectorDialog from '@/pages/FileSharing/Dialog/FileSelectorDialog';

const WS_BASE_URL = `${EDU_API_WEBSOCKET_URL}/${TLDRAW_SYNC_ENDPOINTS.BASE}`;

const TLDrawWithSync = lazy(() => import('./TLDrawWithSync/TLDrawWithSync'));
const TlDrawOffline = lazy(() => import('./TLDrawOffline/TLDrawOffline'));

const Whiteboard = () => {
  const getIsEduApiHealthy = useEduApiStore((s) => s.getIsEduApiHealthy);
  const isEduApiHealthy = useEduApiStore((s) => s.isEduApiHealthy);

  const { t } = useTranslation();

  const liveToken = useUserStore((s) => s.eduApiToken);
  const { eduApiToken } = useUserStore();

  const selectedRoomId = useTLDRawHistoryStore((s) => s.selectedRoomId);
  const setSelectedRoomId = useTLDRawHistoryStore((s) => s.setSelectedRoomId);

  const { editor } = useWhiteboardEditorStore();
  const { isTldrDialogOpen, setUploadTldrDialogOpen, setFilesToUpload, uploadFiles } = useHandelUploadFileStore();
  const { moveOrCopyItemToPath } = useFileSharingDialogStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [fixedToken, setFixedToken] = useState<string | null>(liveToken ?? null);

  const closeTldrDialog = () => setUploadTldrDialogOpen(false);

  const buildTldrBlob = async (name: string): Promise<File> => {
    if (!editor) throw new Error('Editor not ready');
    const f = buildTldrFileFromEditor(editor, name);
    const text = await f.text();
    return new File([text], name, { type: RequestResponseContentType.APPLICATION_OCTET_STREAM });
  };

  const saveTldrFile = async (file: File | Blob) => {
    const targetDir = getPathWithoutWebdav(moveOrCopyItemToPath?.filePath || '');
    setFilesToUpload([file as unknown as File]);
    await uploadFiles(targetDir, eduApiToken);
    setUploadTldrDialogOpen(false);
  };

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
    <PageLayout isFullScreen>
      <Suspense fallback={loader}>
        <div className="z-0 h-full w-full">{getPageContent()}</div>
      </Suspense>

      <SaveExternalFileDialogGeneric
        isOpen={isTldrDialogOpen}
        title={t('saveExternalFileDialogBody.saveExternalFile')}
        Body={SaveExternalFileDialogBody}
        schema={saveExternalFileFormSchema}
        defaultValues={{ filename: '' }}
        onClose={closeTldrDialog}
        normalizeFilename={(raw: string) => (/\.tldr$/i.test(raw) ? raw : `${raw}.tldr`)}
        buildFile={buildTldrBlob}
        onSave={saveTldrFile}
      />
      <FileSelectorDialog />
    </PageLayout>
  );
};

export default Whiteboard;
