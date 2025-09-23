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
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';

const OpenTldrItem: React.FC = () => {
  const { t } = useTranslation();
  const { setAllowedExtensions } = useFileSharingDialogStore();

  const handleSelect = () => {
    setAllowedExtensions(['.tldr']);
  };

  return (
    <TldrawUiMenuItem
      id="openTldr"
      label={t('whiteboard.openTlFile')}
      readonlyOk
      onSelect={handleSelect}
    />
  );
};

export default OpenTldrItem;
