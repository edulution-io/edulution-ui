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
import type { Editor, StoreSnapshot, TLRecord } from 'tldraw';
import loadTldrFileIntoEditor from '@libs/tldraw-sync/utils/loadTldrFileIntoEditor';
import { toast } from 'sonner';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { t } from 'i18next';

interface WhiteboardEditorState {
  editor: Editor | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  setEditor: (editor: Editor | null) => void;
  getSnapshot: () => StoreSnapshot<TLRecord> | null;
  openTldrFromBlobUrl: (blobUrl: string, filename: string) => Promise<void>;
  reset: () => void;
}

const initialValues = {
  editor: null,
  isDialogOpen: false,
};

const useWhiteboardEditorStore = create<WhiteboardEditorState>((set, get) => ({
  ...initialValues,

  setIsDialogOpen: (isOpen) => set({ isDialogOpen: isOpen }),

  setEditor: (editor) => set({ editor }),

  getSnapshot: () => {
    const { editor } = get();
    return editor ? editor.store.getStoreSnapshot() : null;
  },

  openTldrFromBlobUrl: async (blobUrl, filename) => {
    const { editor } = get();
    if (!editor) return;

    const res = await fetch(blobUrl, { cache: 'no-store' });
    if (!res.ok) {
      await res.text().catch(() => '');
      URL.revokeObjectURL(blobUrl);
    }

    const blob = await res.blob();
    const rawText = await blob.text();

    const jsonText = rawText.trimStart().startsWith('--') ? (rawText ?? '') : rawText;

    if (!jsonText || !(jsonText.trimStart().startsWith('{') || jsonText.trimStart().startsWith('['))) {
      URL.revokeObjectURL(blobUrl);
      toast.error(t('whiteboard.openTLFileFailed'));
    }

    const file = new File([jsonText], filename, { type: RequestResponseContentType.APPLICATION_JSON });

    try {
      await loadTldrFileIntoEditor(editor, file);
      toast.success(t('whiteboard.openTLFileSuccess'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t(message));
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  },

  reset: () => set(initialValues),
}));

export default useWhiteboardEditorStore;
