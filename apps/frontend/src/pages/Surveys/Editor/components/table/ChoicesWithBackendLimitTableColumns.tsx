import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircleOutline } from 'react-icons/md';
import { ColumnDef } from '@tanstack/react-table';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import Input from '@/components/shared/Input';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import { Button } from '@/components/shared/Button';

const ChoicesWithBackendLimitTableColumns: ColumnDef<ChoiceDto>[] = [
  {
    id: 'choice-name',
    header: ({ column }) => (
      <SortableHeader<ChoiceDto, unknown>
        titleTranslationId="common.name"
        className="hidden text-foreground lg:flex"
        column={column}
      />
    ),
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { setName } = useQuestionSettingsDialogStore();
      return (
        <Input
          type="text"
          placeholder={t('common.name')}
          value={row.original.name}
          onChange={(e) => setName(row.index, e.target.value)}
          variant="default"
          className="p-2 text-foreground"
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
    header: ({ column }) => (
      <SortableHeader<ChoiceDto, unknown>
        titleTranslationId="common.title"
        column={column}
        className="text-foreground"
      />
    ),
    accessorFn: (row) => row.title,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { setTitle } = useQuestionSettingsDialogStore();
      return (
        <Input
          type="text"
          placeholder={t('common.title')}
          value={row.original.title}
          onChange={(e) => setTitle(row.index, e.target.value)}
          variant="default"
          className="p-2 text-foreground"
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
    header: ({ column }) => (
      <SortableHeader<ChoiceDto, unknown>
        titleTranslationId="survey.editor.questionSettings.upperLimit"
        column={column}
        className="text-foreground"
      />
    ),
    accessorFn: (row) => row.limit,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { setLimit } = useQuestionSettingsDialogStore();
      return (
        <Input
          type="text"
          placeholder={t('survey.editor.questionSettings.limit')}
          value={row.original.limit}
          onChange={(e) => setLimit(row.index, Number(e.target.value))}
          variant="default"
          className="p-2 text-foreground"
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
        titleTranslationId="common.actions"
        column={column}
        className="text-foreground"
      />
    ),
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { removeChoice } = useQuestionSettingsDialogStore();
      return (
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={() => removeChoice(row.original.name)}
            variant="btn-outline"
            className="my-1 flex max-h-[2.25rem] w-[75px] items-center justify-center text-ciRed"
          >
            <MdRemoveCircleOutline />
          </Button>
        </div>
      );
    },
  },
];

export default ChoicesWithBackendLimitTableColumns;
