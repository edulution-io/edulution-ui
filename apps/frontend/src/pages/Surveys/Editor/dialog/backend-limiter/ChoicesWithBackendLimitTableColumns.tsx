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
import { MdRemoveCircleOutline } from 'react-icons/md';
import { ColumnDef } from '@tanstack/react-table';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import { Button } from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import SortableHeader from '@/components/ui/Table/SortableHeader';

const ChoicesWithBackendLimitTableColumns: ColumnDef<ChoiceDto>[] = [
  {
    id: 'choice-name',
    header: ({ column }) => (
      <SortableHeader<ChoiceDto, unknown>
        className="hidden text-primary-foreground lg:flex"
        column={column}
      />
    ),
    meta: {
      translationId: 'common.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { setChoiceName } = useQuestionsContextMenuStore();
      return (
        <Input
          type="text"
          placeholder={t('common.name')}
          value={row.original.name}
          onChange={(e) => setChoiceName(row.original.name, e.target.value)}
          variant="dialog"
          className="p-2 text-primary-foreground"
        />
      );
    },
    sortingFn: (rowA, rowB) => {
      const choiceNameA = rowA.original.name;
      const choiceNameB = rowB.original.name;
      if (!choiceNameB) {
        return 1;
      }
      if (!choiceNameA) {
        return -1;
      }
      return choiceNameA.localeCompare(choiceNameB);
    },
  },
  {
    id: 'choice-title',
    header: ({ column }) => <SortableHeader<ChoiceDto, unknown> column={column} />,
    meta: {
      translationId: 'common.title',
    },
    accessorFn: (row) => row.title,
    cell: ({ row }) => {
      const { t } = useTranslation();
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
    sortingFn: (rowA, rowB) => {
      const choiceTitleA = rowA.original.title;
      const choiceTitleB = rowB.original.title;
      if (!choiceTitleB) {
        return 1;
      }
      if (!choiceTitleA) {
        return -1;
      }
      return choiceTitleA.localeCompare(choiceTitleB);
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
      const { t } = useTranslation();
      const { setChoiceLimit } = useQuestionsContextMenuStore();
      return (
        <Input
          type="number"
          placeholder={t('survey.editor.questionSettings.limit')}
          value={row.original.limit}
          onChange={(e) => setChoiceLimit(row.original.name, Number(e.target.value))}
          variant="dialog"
          className="p-2 text-primary-foreground"
        />
      );
    },
    sortingFn: (rowA, rowB) => {
      const choiceLimitA = rowA.original.limit;
      const choiceLimitB = rowB.original.limit;
      if (!choiceLimitB) {
        return 1;
      }
      if (!choiceLimitA) {
        return -1;
      }
      if (choiceLimitA === choiceLimitB) {
        return 0;
      }
      if (choiceLimitA < choiceLimitB) {
        return -1;
      }
      return 1;
    },
  },
  {
    id: 'choice-delete-button',
    header: ({ column }) => (
      <SortableHeader<ChoiceDto, unknown>
        column={column}
        className="m-0 w-[90px] p-0 text-primary-foreground"
      />
    ),
    meta: {
      translationId: 'common.actions',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { removeChoice } = useQuestionsContextMenuStore();
      return (
        <div className="m-0 flex w-[85px] justify-center p-0">
          <Button
            type="button"
            onClick={() => removeChoice(row.original.name)}
            variant="btn-collaboration"
            className="m-0 flex max-h-[2.25rem] w-[80px] items-center justify-center rounded-md p-0 text-ciRed"
          >
            <MdRemoveCircleOutline className="h-[20px] w-[20px]" />
          </Button>
        </div>
      );
    },
  },
];

export default ChoicesWithBackendLimitTableColumns;
