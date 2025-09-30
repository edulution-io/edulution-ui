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
import { TldrawUiMenuItem } from 'tldraw';
import { useTranslation } from 'react-i18next';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import buildTldrFileFromEditor from '@libs/tldraw-sync/utils/buildTldrFileFromEditor';

const SaveLocalTldrItem: React.FC = () => {
  const { t } = useTranslation();
  const { editor } = useWhiteboardEditorStore();

  const handleSave = () => {
    if (!editor) {
      throw new Error('Editor not ready');
    }

    const file = buildTldrFileFromEditor(editor, 'whiteboard');
    const blobUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <TldrawUiMenuItem
      id="saveLocalTldrItem"
      label={t('common.saveLocal')}
      readonlyOk
      onSelect={handleSave}
    />
  );
};

export default SaveLocalTldrItem;
