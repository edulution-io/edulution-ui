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
import { useTranslation } from 'react-i18next';
import { DropdownSelect } from '@/components';
import { type DropdownOptions } from '@/components/ui/DropdownSelect/DropdownSelect';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';

interface WebdavShareSelectDropdownProps {
  selectedShare: string;
  setSelectedShare: React.Dispatch<React.SetStateAction<string>>;
  webdavShares: WebdavShareDto[];
}

const WebdavShareSelectDropdown: React.FC<WebdavShareSelectDropdownProps> = ({
  selectedShare,
  setSelectedShare,
  webdavShares,
}) => {
  const { t } = useTranslation();

  const webdavShareOptions: DropdownOptions[] = webdavShares.map((item) => ({
    id: item.displayName,
    name: item.displayName,
  }));

  return (
    <DropdownSelect
      placeholder={t('whiteboard-collaboration.dropdownPlaceholder')}
      options={webdavShareOptions}
      selectedVal={selectedShare}
      handleChange={setSelectedShare}
      variant="dialog"
    />
  );
};

export default WebdavShareSelectDropdown;
