import React from 'react';
import { format } from 'date-fns';
import i18next from 'i18next';
import { ColumnDef } from '@tanstack/react-table';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { ButtonSH } from '@/components/ui/ButtonSH';

const SurveyTableColumns: ColumnDef<SurveyDto>[] = [
  {
    id: 'select-survey',

    header: ({ table, column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="common.title"
        table={table}
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { selectSurvey, setSelectedRows } = useSurveyTablesPageStore();
      const survey = row.original;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let surveyObj = JSON.parse(JSON.stringify(survey.formula));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!surveyObj.elements && !surveyObj.pages[0].elements) {
        surveyObj = undefined;
      }
      return (
        <div className="w-full">
          <SelectableTextCell
            row={row}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            text={surveyObj?.title || i18next.t('common.not-available')}
            onClick={() => {
              setSelectedRows({});
              selectSurvey(survey);
              row.toggleSelected();
            }}
          />
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'created',
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="survey.creationDate"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { selectSurvey, setSelectedRows } = useSurveyTablesPageStore();
      const survey = row.original;
      const localDateFormat = getLocaleDateFormat();
      return (
        <ButtonSH
          onClick={() => {
            setSelectedRows({});
            selectSurvey(survey);
            row.toggleSelected();
          }}
        >
          <span className="overflow-hidden text-ellipsis">
            {survey?.created
              ? format(survey.created, 'PPP', { locale: localDateFormat })
              : i18next.t('common.not-available')}
          </span>
        </ButtonSH>
      );
    },

    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.created;
      const dateB = rowB.original.created;
      if (!dateA || !dateB) {
        return !dateA ? -1 : 1;
      }
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: 'expires',
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="survey.expirationDate"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { selectSurvey, setSelectedRows } = useSurveyTablesPageStore();
      const survey = row.original;
      const localDateFormat = getLocaleDateFormat();
      return (
        <ButtonSH
          onClick={() => {
            setSelectedRows({});
            selectSurvey(survey);
            row.toggleSelected();
          }}
        >
          <span className="overflow-hidden text-ellipsis">
            {survey?.expires
              ? format(survey.expires, 'PPP', { locale: localDateFormat })
              : i18next.t('common.not-available')}
          </span>
        </ButtonSH>
      );
    },

    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.expires;
      const dateB = rowB.original.expires;
      if (!dateA || !dateB) {
        return !dateA ? -1 : 1;
      }
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    id: 'participated',
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        titleTranslationId="common.participated"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { selectSurvey, setSelectedRows } = useSurveyTablesPageStore();
      const survey = row.original;
      return (
        <ButtonSH
          className="hidden lg:flex"
          onClick={() => {
            setSelectedRows({});
            selectSurvey(survey);
            row.toggleSelected();
          }}
        >
          <span className="flex justify-center font-medium">
            {survey?.invitedAttendees && survey?.participatedAttendees
              ? `${survey?.participatedAttendees.length || 0}/${survey?.invitedAttendees.length || 0}`
              : i18next.t('common.not-available')}
          </span>
        </ButtonSH>
      );
    },
  },
];

export default SurveyTableColumns;
