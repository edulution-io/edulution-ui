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
import { ScrollArea } from '@/components/ui/ScrollArea';

const ItemDialogList = ({
  deleteWarningTranslationId,
  items,
}: {
  items: { id: string; name: string }[];
  deleteWarningTranslationId: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-background">
      <p>{t(deleteWarningTranslationId)}</p>
      <ScrollArea className="mt-2 h-64 w-96 max-w-full overflow-y-auto rounded border p-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="truncate"
          >
            {item.name}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ItemDialogList;
