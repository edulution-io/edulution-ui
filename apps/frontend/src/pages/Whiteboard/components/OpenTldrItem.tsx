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

import React from 'react';
import { TldrawUiMenuItem, useEditor } from 'tldraw';
import { useTranslation } from 'react-i18next';
import loadTldrFileIntoEditor from '@libs/tldraw-sync/utils/loadTldrFileIntoEditor';

const OpenTldrItem: React.FC = () => {
  const editor = useEditor();
  const { t } = useTranslation();

  const handleSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tldr';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && editor) {
        try {
          await loadTldrFileIntoEditor(editor, file);
        } finally {
          document.body.removeChild(input);
        }
      } else {
        document.body.removeChild(input);
      }
    };
    document.body.appendChild(input);
    input.click();
  };

  return (
    <TldrawUiMenuItem
      id="openTldr"
      label={t('whiteboard.openTlFile', 'Open .tldr file')}
      readonlyOk
      onSelect={handleSelect}
    />
  );
};

export default OpenTldrItem;
