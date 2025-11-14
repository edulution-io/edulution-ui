/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';

const ItemDialogList = ({
  deleteWarningTranslationId,
  items,
}: {
  items: { id: string; name: string }[];
  deleteWarningTranslationId?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-background">
      {deleteWarningTranslationId && <p>{t(deleteWarningTranslationId)}</p>}
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
