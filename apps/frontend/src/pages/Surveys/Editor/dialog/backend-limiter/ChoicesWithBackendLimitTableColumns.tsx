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
import { t } from 'i18next';
import { HiTrash } from 'react-icons/hi';
import { ColumnDef } from '@tanstack/react-table';
import ID_ACTION_TABLE_COLUMN from '@libs/common/constants/idActionTableColumn';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Input from '@/components/shared/Input';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import TableActionCell from '@/components/ui/Table/TableActionCell';

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
              icon: HiTrash,
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
