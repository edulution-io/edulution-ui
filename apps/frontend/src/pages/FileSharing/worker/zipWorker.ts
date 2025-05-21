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

import JSZip from 'jszip';

globalThis.onmessage = async (e: MessageEvent<{ files: File[]; root: string }>) => {
  const { files, root } = e.data;

  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.webkitRelativePath.replace(`${root}/`, ''), file);
  });

  const blob = await zip.generateAsync({ type: 'blob' }, (meta) => globalThis.postMessage({ progress: meta.percent }));

  globalThis.postMessage({ blob, root });
};
