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

type WebdavShareSelectDropdownProps = { webdavShare?: string; showRootOnly?: boolean };

const WebdavShareSelectDropdown: React.FC<WebdavShareSelectDropdownProps> = ({ webdavShare, showRootOnly = false }) => {
  const { t } = useTranslation();
  const { webdavShares, selectedWebdavShare, setSelectedWebdavShare } = useFileSharingStore();

  const filteredShares = showRootOnly ? webdavShares.filter((share) => share.isRootPath) : webdavShares;

  const webdavShareOptions: DropdownOptions[] = filteredShares.map((item) => ({
    id: item.displayName,
    name: item.displayName,
  }));

  useEffect(() => {
    if (webdavShares.length > 0) {
      const currentWebdavShare =
        filteredShares.find((share) => share.displayName === webdavShare)?.displayName ||
        filteredShares[0]?.displayName;

      setSelectedWebdavShare(currentWebdavShare);
    }
  }, [webdavShare, webdavShares, showRootOnly]);

  return (
    <DropdownSelect
      placeholder={t('webdavShare.selectPlaceholder')}
      options={webdavShareOptions}
      selectedVal={selectedWebdavShare}
      handleChange={setSelectedWebdavShare}
      variant="dialog"
      translate={false}
      searchEnabled={false}
    />
  );
};

export default WebdavShareSelectDropdown;
