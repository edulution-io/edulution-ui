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

import { Editor, TLPageId } from 'tldraw';

export const hasSetCurrentPageId = (editor: Editor): editor is Editor & { setCurrentPageId: (id: TLPageId) => void } =>
  typeof (editor as unknown as { setCurrentPageId?: (id: TLPageId) => void }).setCurrentPageId === 'function';

export const hasSetCurrentPage = (editor: Editor): editor is Editor & { setCurrentPage: (id: TLPageId) => void } =>
  typeof (editor as unknown as { setCurrentPage?: (id: TLPageId) => void }).setCurrentPage === 'function';
