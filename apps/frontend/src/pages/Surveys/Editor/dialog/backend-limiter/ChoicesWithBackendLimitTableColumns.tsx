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
import { t } from 'i18next';
import { ColumnDef } from '@tanstack/react-table';
import ID_ACTION_TABLE_COLUMN from '@libs/common/constants/idActionTableColumn';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Input from '@/components/shared/Input';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import TableActionCell from '@/components/ui/Table/TableActionCell';
import STANDARD_ACTION_ICONS from '@libs/common/constants/standardActionIcons';
import StandardActionTypes from '@libs/common/constants/standardActionTypes';

const ChoicesWithBackendLimitTableColumns: ColumnDef<ChoiceDto>[] = [
  {
    id: 'choice-title',
    header: ({ column }) => <SortableHeader<ChoiceDto, unknown> column={column} />,
    meta: {
      translationId: 'common.title',
    },
    accessorFn: (row) => row.title,
    cell: ({ row }) => {
      const { setChoiceTitle } = useQuestionsContextMenuStore();
      return (
        <Input
          type="text"
          placeholder={t('common.title')}
          value={row.original.title}
          onChange={(e) => setChoiceTitle(row.original.name, e.target.value)}
          variant="dialog"
          className="flex-1 p-2 text-primary-foreground"
        />
      );
    },
  },
  {
    id: 'choice-limit',
    header: ({ column }) => <SortableHeader<ChoiceDto, unknown> column={column} />,
    meta: {
      translationId: 'survey.editor.questionSettings.upperLimit',
    },
    accessorFn: (row) => row.limit,
    cell: ({ row }) => {
      const { setChoiceLimit } = useQuestionsContextMenuStore();
      return (
        <Input
          type="number"
          min="0"
          placeholder={t('survey.editor.questionSettings.limit')}
          value={row.original.limit}
          onChange={(e) => setChoiceLimit(row.original.name, Number(e.target.value))}
          variant="dialog"
          className="p-2 text-primary-foreground"
        />
      );
    },
  },
  {
    id: ID_ACTION_TABLE_COLUMN,
    header: () => <div className="flex items-center justify-center">{t('common.actions')}</div>,
    meta: {
      translationId: 'common.actions',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { removeChoice } = useQuestionsContextMenuStore();

      return (
        <TableActionCell
          actions={[
            {
              icon: STANDARD_ACTION_ICONS[StandardActionTypes.REMOVE],
              translationId: 'common.delete',
              onClick: () => (row ? removeChoice(row.original.name) : undefined),
            },
          ]}
          row={row}
        />
      );
    },
    size: 100,
  },
];

export default ChoicesWithBackendLimitTableColumns;
