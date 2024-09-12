import React from 'react';
import { format } from 'date-fns';
import i18next from 'i18next';
import { ColumnDef } from '@tanstack/react-table';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormulaDto from '@libs/survey/types/surveyFormula.dto';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
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
    sortingFn: (rowA, rowB) => {
      const surveyA = rowA.original;
      const surveyB = rowB.original;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const surveyFormulaA: SurveyFormulaDto | undefined = JSON.parse(JSON.stringify(surveyA.formula));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const surveyFormulaB: SurveyFormulaDto | undefined = JSON.parse(JSON.stringify(surveyB.formula));

      const valueA: string | undefined = surveyFormulaA?.title;
      const valueB: string | undefined = surveyFormulaB?.title;

      if (!valueB) {
        return 1;
      }
      if (!valueA) {
        return -1;
      }
      return valueA.localeCompare(valueB);
    },
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
      if (!dateB) {
        return 1;
      }
      if (!dateA) {
        return -1;
      }
      if (dateA === dateB) {
        return 0;
      }
      if (dateA < dateB) {
        return -1;
      }
      return 1;
    },
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
      if (!dateB) {
        return 1;
      }
      if (!dateA) {
        return -1;
      }
      if (dateA === dateB) {
        return 0;
      }
      if (dateA < dateB) {
        return -1;
      }
      return 1;
    },
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
    sortingFn: (rowA, rowB) => {
      const surveyA: SurveyDto = rowA.original;
      const surveyB: SurveyDto = rowB.original;
      if (!surveyB) {
        return 1;
      }
      if (!surveyA) {
        return -1;
      }

      const invitesA: number = surveyA.invitedAttendees.length;
      const invitesB: number = surveyB.invitedAttendees.length;
      if (!invitesB) {
        return 1;
      }
      if (!invitesA) {
        return -1;
      }
      if (invitesB > invitesA) {
        return -1;
      }
      if (invitesB < invitesA) {
        return 1;
      }

      const participatesA: number = surveyA.participatedAttendees.length;
      const participatesB: number = surveyB.participatedAttendees.length;
      if (!participatesB) {
        return 1;
      }
      if (!participatesA) {
        return -1;
      }
      if (participatesA === participatesB) {
        return 0;
      }
      if (participatesA < participatesB) {
        return -1;
      }
      return 1;
    },
  },
];

export default SurveyTableColumns;
