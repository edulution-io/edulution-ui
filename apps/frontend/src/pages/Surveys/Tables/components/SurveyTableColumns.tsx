import React from 'react';
import i18next from 'i18next';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import sortDate from '@libs/common/utils/sortDate';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import sortSurveyByTitle from '@libs/survey/utils/sortSurveyByTitle';
import sortSurveyByInvitesAndParticipation from '@libs/survey/utils/sortSurveyByInvitesAndParticipation';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { ButtonSH } from '@/components/ui/ButtonSH';

const SurveyTableColumns: ColumnDef<SurveyDto>[] = [
  {
    id: 'select-survey',
    accessorKey: 'formula',
    enableHiding: false,
    enableSorting: true,
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="common.title"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { onClickSurveysTableCell } = useSurveyTablesPageStore();
      return (
        <SelectableTextCell
          row={row}
          text={row.original.formula.title || i18next.t('common.not-available')}
          onClick={() => onClickSurveysTableCell(row)}
          className="h-full w-full"
        />
      );
    },
    sortingFn: (rowA, rowB) => sortSurveyByTitle(rowA.original, rowB.original),
  },
  {
    accessorKey: 'created',
    enableSorting: true,
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="survey.creationDate"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { onClickSurveysTableCell } = useSurveyTablesPageStore();
      const localDateFormat = getLocaleDateFormat();
      return (
        <ButtonSH
          onClick={() => onClickSurveysTableCell(row)}
          className="h-full w-full"
        >
          <span className="overflow-hidden text-ellipsis font-medium">
            {row.original?.created
              ? format(row.original.created, 'PPP', { locale: localDateFormat })
              : i18next.t('common.not-available')}
          </span>
        </ButtonSH>
      );
    },
    sortingFn: (rowA, rowB) => sortDate(rowA.original.created, rowB.original.created),
  },
  {
    accessorKey: 'expires',
    enableSorting: true,
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="survey.expirationDate"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { onClickSurveysTableCell } = useSurveyTablesPageStore();
      const localDateFormat = getLocaleDateFormat();
      return (
        <ButtonSH
          onClick={() => onClickSurveysTableCell(row)}
          className="h-full w-full"
        >
          <span className="overflow-hidden text-ellipsis font-medium">
            {row.original?.expires
              ? format(row.original.expires, 'PPP', { locale: localDateFormat })
              : i18next.t('common.not-available')}
          </span>
        </ButtonSH>
      );
    },
    sortingFn: (rowA, rowB) => sortDate(rowA.original.expires, rowB.original.expires),
  },
  {
    id: 'participated',
    accessorKey: 'participatedAttendees',
    enableSorting: true,
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="common.participated"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { onClickSurveysTableCell } = useSurveyTablesPageStore();
      return (
        <ButtonSH
          onClick={() => onClickSurveysTableCell(row)}
          className="hidden h-full w-full lg:flex"
        >
          <span className="flex justify-center font-medium">
            {row.original?.participatedAttendees.length || 0} / {row.original?.invitedAttendees.length || 0}
          </span>
        </ButtonSH>
      );
    },
    sortingFn: (rowA, rowB) => sortSurveyByInvitesAndParticipation(rowA.original, rowB.original),
  },
];

export default SurveyTableColumns;
