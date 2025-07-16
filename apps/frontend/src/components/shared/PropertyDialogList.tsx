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
import DialogProperty from '@libs/common/types/dialog-property';
import Input from '@/components/shared/Input';
import Label from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface PropertyDialogListProps {
  deleteWarningTranslationId?: string;
  items: DialogProperty[];
  disabled?: boolean;
}

const PropertyDialogList = ({ deleteWarningTranslationId, items, disabled }: PropertyDialogListProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-background">
      {deleteWarningTranslationId && <p>{t(deleteWarningTranslationId)}</p>}
      <ScrollArea className="mt-2 h-fit max-h-[calc(100vh-400px)] min-h-[100px] w-96 max-w-full overflow-y-auto rounded">
        <div className="flex flex-col gap-2">
          {items.map(({ id, value, translationId }: DialogProperty) => (
            <div
              key={`deletion-dialog-properties-${id}`}
              className="inline-flex w-full items-center p-0"
            >
              {translationId ? (
                <Label className="mr-4 inline-block min-w-[80px] font-bold text-background">{t(translationId)}:</Label>
              ) : null}
              <Input
                type="text"
                value={value || t('common.not-available')}
                readOnly={disabled}
                disabled={disabled}
                widthVariant="dialog"
                className="min-w-[100px] cursor-pointer"
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PropertyDialogList;
