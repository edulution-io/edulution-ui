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
import FILE_LINK_EXPIRY_VALUES from '@libs/filesharing/constants/fileLinkExpiryValues';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import DropdownMenu from '@/components/shared/DropdownMenu';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import { Button } from '@/components/shared/Button';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FilesharingDialogProps } from '@libs/filesharing/types/filesharingDialogProps';

const ShareFileFolderLinkDialogBody: React.FC<FilesharingDialogProps> = ({ form }) => {
  const { t } = useTranslation();
  const { selectedItems } = useFileSharingStore();
  const currentExpiry = form.watch('expires');

  useEffect(() => {
    form.register('expires');
  }, [form]);

  const handleSelectExpiry = (value: (typeof FILE_LINK_EXPIRY_VALUES)[number]) => {
    form.setValue('expires', value, { shouldDirty: true, shouldValidate: true });
  };

  const expiryItems: DropdownMenuItemType[] = FILE_LINK_EXPIRY_VALUES.map((value) => ({
    label: t(`filesharing.expiry.${value}`),
    isCheckbox: true,
    checked: currentExpiry === value,
    onCheckedChange: () => handleSelectExpiry(value),
  }));

  const displayLabel = currentExpiry ? t(`filesharing.expiry.${currentExpiry}`) : t('filesharing.expiry.select');

  return (
    <div className="flex flex-col gap-4">
      <p className="truncate text-sm text-muted-foreground">{selectedItems.at(0)?.filename}</p>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{t('shareDialog.expiryLabel')}</span>
        <DropdownMenu
          trigger={
            <Button
              type="button"
              variant="btn-small"
              className="w-full justify-between bg-muted text-secondary"
              title={t('filesharing.tooltips.expiry')}
            >
              {displayLabel} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          }
          items={expiryItems}
          menuContentClassName="min-w-[10rem]"
        />
      </div>
    </div>
  );
};

export default ShareFileFolderLinkDialogBody;
