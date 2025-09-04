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
import 'tldraw/tldraw.css';
import { useTranslation } from 'react-i18next';

const SaveAsTldrItem = () => {
  const editor = useEditor();
  const { t } = useTranslation();

  const handleSave = () => {
    const snapshot = editor.store.getSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.tldr`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TldrawUiMenuItem
      id="saveAsTldr"
      label={t('common.save')}
      readonlyOk
      onSelect={handleSave}
    />
  );
};

export default SaveAsTldrItem;
