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

import { create } from 'zustand';
import { toast } from 'sonner';
import i18n from '@/i18n';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useUserStore from '@/store/UserStore/useUserStore';
import createUploadClient from '@libs/filesharing/utils/createUploadClient';
import uploadOctetStream from '@libs/filesharing/utils/uploadOctetStream';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';

type TextEditorStore = {
  editedContent: string | null;
  originalContent: string | null;
  isSaving: boolean;
  isUnsavedChangesDialogOpen: boolean;
  pendingCloseAction: (() => void | Promise<void>) | null;

  setEditedContent: (content: string) => void;
  setOriginalContent: (content: string) => void;
  openUnsavedChangesDialog: (onClose: () => void | Promise<void>) => void;
  closeUnsavedChangesDialog: () => void;
  executePendingCloseAction: () => void;
  hasUnsavedChanges: () => boolean;
  saveTextFile: (webdavShare: string | undefined) => Promise<void>;
  reset: () => void;
};

const initialState = {
  editedContent: null,
  originalContent: null,
  isSaving: false,
  isUnsavedChangesDialogOpen: false,
  pendingCloseAction: null,
};

const useTextEditorStore = create<TextEditorStore>((set, get) => ({
  ...initialState,

  setEditedContent: (content) => set({ editedContent: content }),

  setOriginalContent: (content) => set({ originalContent: content, editedContent: content }),

  openUnsavedChangesDialog: (onClose) => set({ isUnsavedChangesDialogOpen: true, pendingCloseAction: onClose }),

  closeUnsavedChangesDialog: () => set({ isUnsavedChangesDialogOpen: false, pendingCloseAction: null }),

  executePendingCloseAction: () => {
    const { pendingCloseAction } = get();
    if (pendingCloseAction) {
      void pendingCloseAction();
    }
    set({ isUnsavedChangesDialogOpen: false, pendingCloseAction: null });
  },

  hasUnsavedChanges: () => {
    const { editedContent, originalContent } = get();
    if (editedContent === null || originalContent === null) return false;
    return editedContent !== originalContent;
  },

  saveTextFile: async (webdavShare) => {
    const { currentlyEditingFile } = useFileEditorStore.getState();
    const { eduApiToken } = useUserStore.getState();
    const { editedContent } = get();

    if (!currentlyEditingFile || editedContent === null) return;

    set({ isSaving: true });
    try {
      const uploadClient = createUploadClient(`/${EDU_API_ROOT}`, { share: webdavShare }, eduApiToken);
      const uploadUrl = `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.UPLOAD}`;

      const { filePath } = currentlyEditingFile;
      const fileName = currentlyEditingFile.filename;
      const parentPath = filePath.substring(0, filePath.lastIndexOf('/') + 1);

      const blob = new Blob([editedContent], { type: RequestResponseContentType.TEXT_PLAIN });
      const query = new URLSearchParams();
      query.set(URL_SEARCH_PARAMS.PATH, parentPath);
      query.set('name', fileName);
      query.set('contentLength', String(blob.size));
      const url = `${uploadUrl}?${query.toString()}`;

      await uploadOctetStream(uploadClient, url, blob);

      set({ originalContent: editedContent });
      toast.success(i18n.t('filesharing.textEditor.saveSuccess'));
    } catch {
      toast.error(i18n.t('filesharing.textEditor.saveError'));
    } finally {
      set({ isSaving: false });
    }
  },

  reset: () => set(initialState),
}));

export default useTextEditorStore;
