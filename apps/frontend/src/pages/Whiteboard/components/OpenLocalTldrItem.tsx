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

import React, { useEffect, useRef } from 'react';
import { TldrawUiMenuItem } from 'tldraw';
import { useTranslation } from 'react-i18next';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';

const OpenLocalTldrItem: React.FC = () => {
  const { t } = useTranslation();
  const { openTldrFromBlobUrl } = useWhiteboardEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tldr';
    input.style.display = 'none';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const blobUrl = URL.createObjectURL(file);
      await openTldrFromBlobUrl(blobUrl, file.name);
    };
    document.body.appendChild(input);
    fileInputRef.current = input;

    return () => {
      document.body.removeChild(input);
    };
  }, [openTldrFromBlobUrl]);

  const handleSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <TldrawUiMenuItem
      id="openLocalTldrItem"
      label={t('common.openLocal')}
      readonlyOk
      onSelect={handleSelect}
    />
  );
};

export default OpenLocalTldrItem;
