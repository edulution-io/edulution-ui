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
import 'tldraw/tldraw.css';
import { useTranslation } from 'react-i18next';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';

const SaveAsTldrItem = () => {
  const { t } = useTranslation();
  const { setIsDialogOpen } = useWhiteboardEditorStore();

  const handleSave = () => {
    setIsDialogOpen(true);
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
