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

import { Editor, StoreSnapshot, TLRecord } from 'tldraw';
import toStoreSnapshot from '@libs/tldraw-sync/utils/toStoreSnapshot';
import isTldrFileV1 from '@libs/tldraw-sync/utils/isTldrFileV1';
import firstPageIdFrom from '@libs/tldraw-sync/utils/firstPageIdFrom';
import { hasSetCurrentPage, hasSetCurrentPageId } from '@libs/tldraw-sync/utils/editorGuards';
import nextAnimationFrame from '@libs/tldraw-sync/utils/nextAnimationFrame';

const loadTldrFileIntoEditor = async (editor: Editor, file: File): Promise<void> => {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;

  let snapshot: StoreSnapshot<TLRecord> = isTldrFileV1(parsed)
    ? toStoreSnapshot(parsed)
    : (parsed as StoreSnapshot<TLRecord>);

  try {
    editor.loadSnapshot(snapshot);
  } catch {
    const currentSchema = editor.getSnapshot().document.schema;
    const adjusted: StoreSnapshot<TLRecord> = { schema: currentSchema, store: snapshot.store };
    editor.loadSnapshot(adjusted);
    snapshot = adjusted;
  }

  const firstPageId = firstPageIdFrom(snapshot);
  if (firstPageId) {
    const current = editor.getCurrentPageId();
    if (current !== firstPageId) {
      if (hasSetCurrentPageId(editor)) {
        editor.setCurrentPageId(firstPageId);
      } else if (hasSetCurrentPage(editor)) {
        editor.setCurrentPage(firstPageId);
      }
    }
  }

  await nextAnimationFrame();
  editor.zoomToFit();
  editor.selectNone();
};

export default loadTldrFileIntoEditor;
