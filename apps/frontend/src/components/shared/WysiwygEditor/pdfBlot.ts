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

import ReactQuill from 'react-quill-new';

const Quill = ReactQuill.Quill as unknown as {
  import: (path: string) => unknown;
  register: (...args: unknown[]) => void;
};

type BlockEmbedCtor = {
  new (...args: unknown[]): unknown;
  create(value: unknown): HTMLElement;
  value(node: HTMLElement): unknown;
  blotName: string;
  tagName: string;
  className: string;
};

const BlockEmbed = Quill.import('blots/block/embed') as BlockEmbedCtor;

class PdfBlot extends BlockEmbed {
  static blotName = 'pdf';

  static tagName = 'div';

  static className = 'ql-embed-pdf';

  static create(src: string) {
    /* eslint-disable
     @typescript-eslint/no-unsafe-call,
     @typescript-eslint/no-unsafe-member-access */
    const node = super.create() as HTMLElement;
    /* eslint-enable
     @typescript-eslint/no-unsafe-call,
     @typescript-eslint/no-unsafe-member-access */
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = '100%';
    iframe.height = '450';
    iframe.frameBorder = '0';
    node.appendChild(iframe);
    return node;
  }

  static value(node: HTMLElement) {
    return node.querySelector('iframe')?.getAttribute('src') ?? '';
  }
}

Quill.register(PdfBlot);
