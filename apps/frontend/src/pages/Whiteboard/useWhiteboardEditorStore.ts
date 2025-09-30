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
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  },

  reset: () => set(initialValues),
}));

export default useWhiteboardEditorStore;
