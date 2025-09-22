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

import type { Editor, StoreSnapshot, TLRecord } from 'tldraw';
import buildTldrFileFromSnapshot from './buildTldrFileFromSnapshot';

const buildTldrFileFromEditor = (editor: Editor, filename: string): File => {
  const storeSnapshot: StoreSnapshot<TLRecord> = editor.getSnapshot().document;
  return buildTldrFileFromSnapshot(storeSnapshot, filename);
};

export default buildTldrFileFromEditor;
