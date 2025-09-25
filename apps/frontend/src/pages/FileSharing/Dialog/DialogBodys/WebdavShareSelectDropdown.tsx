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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownSelect } from '@/components';
import { type DropdownOptions } from '@/components/ui/DropdownSelect/DropdownSelect';
import useFileSharingStore from '../../useFileSharingStore';

const WebdavShareSelectDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { webdavShares, selectedWebdavShare, setSelectedWebdavShare } = useFileSharingStore();

  const webdavShareOptions: DropdownOptions[] = webdavShares.map((item) => ({
    id: item.displayName,
    name: item.displayName,
  }));

  useEffect(() => {
    if (webdavShares.length > 0) {
      setSelectedWebdavShare(webdavShares[0].displayName);
    }
  }, []);

  return (
    <DropdownSelect
      placeholder={t('whiteboard-collaboration.dropdownPlaceholder')}
      options={webdavShareOptions}
      selectedVal={selectedWebdavShare}
      handleChange={setSelectedWebdavShare}
      variant="dialog"
    />
  );
};

export default WebdavShareSelectDropdown;
