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

interface WhiteboardEditorState {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  getSnapshot: () => StoreSnapshot<TLRecord> | null;
  reset: () => void;
}

const initialValues = { editor: null as Editor | null };

const useWhiteboardEditorStore = create<WhiteboardEditorState>((set, get) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
  getSnapshot: () => {
    const { editor } = get();
    return editor ? editor.store.getStoreSnapshot() : null;
  },
  reset: () => set(initialValues),
}));

export default useWhiteboardEditorStore;
