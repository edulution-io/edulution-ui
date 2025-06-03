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

import * as React from 'react';

interface PdfRendererProps {
  fileSrc: string;
  preview?: boolean;
}

const TOOLBAR_OFF_PARAMS = '#toolbar=0&navpanes=0&scrollbar=0';

const PdfRenderer: React.FC<PdfRendererProps> = ({ fileSrc, preview = false }) => {
  let finalSrc = fileSrc;

  if (preview) {
    const hasFragment = fileSrc.includes('#');
    finalSrc = hasFragment ? fileSrc : `${fileSrc}${TOOLBAR_OFF_PARAMS}`;
  }

  return (
    <iframe
      src={finalSrc}
      title="PDF"
      loading="lazy"
      className="h-full min-h-screen w-full border-0"
    />
  );
};
export default PdfRenderer;
