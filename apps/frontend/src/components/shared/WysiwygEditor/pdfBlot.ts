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
import { EmbedBlot } from 'parchment';
import { Quill } from 'react-quill-new';

class PdfBlot extends EmbedBlot {
  static blotName = 'pdf';

  static tagName = 'div';

  static create(src: string) {
    const node = super.create() as HTMLElement;
    let filename: string;
    let url = src;

    if (src.startsWith('/filename=')) {
      const [, name, rest] = src.match(/^\/filename=([^/]+?)(\/.+)$/)!;
      filename = decodeURIComponent(name);
      url = rest;
    } else {
      const [fileWithQuery] = src.split('/').slice(-1);
      [filename] = fileWithQuery.split('?');
    }
    const iframe = document.createElement('iframe');
    iframe.src = url.includes('#') ? url : `${url}#toolbar=0&navpanes=0&scrollbar=0`;
    iframe.width = '100%';
    iframe.height = '450';
    iframe.style.border = 'none';
    const a = document.createElement('a');
    a.href = url;
    a.textContent = filename;
    a.download = filename;
    a.setAttribute('aria-hidden', 'true');
    a.style.display = 'none';
    node.setAttribute('data-filename', filename);

    node.append(iframe, a);
    return node;
  }

  static value(node: HTMLElement) {
    return node.querySelector('iframe')?.getAttribute('src') ?? '';
  }
}

Quill.register(PdfBlot);
