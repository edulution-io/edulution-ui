import React from 'react';
import i18next from 'i18next';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { PiEyeLight, PiEyeSlash } from 'react-icons/pi';
import { ColumnDef } from '@tanstack/react-table';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import sortDate from '@libs/common/utils/sortDate';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import sortSurveyByTitle from '@libs/survey/utils/sortSurveyByTitle';
import sortSurveyByInvitesAndParticipation from '@libs/survey/utils/sortSurveyByInvitesAndParticipation';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { ButtonSH } from '@/components/ui/ButtonSH';
import copyToClipboard from '@/utils/copyToClipboard';

const hideOnMobileClassName = 'hidden lg:flex min-w-24';

const SurveyTableColumns: ColumnDef<SurveyDto>[] = [
  {
    id: 'select-survey',
    accessorKey: 'formula',
    enableHiding: false,
    enableSorting: true,
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'common.title',
    },
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
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'survey.creationDate',
    },
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
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'survey.expirationDate',
    },
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
    id: 'survey-isPublic',
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        className={hideOnMobileClassName}
        column={column}
      />
    ),
    meta: {
      translationId: 'survey.isPublic',
    },
    accessorFn: (row) => row.isPublic,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const iconSize = 16;
      const { isPublic } = row.original;
      const url = `${window.location.origin}/${PUBLIC_SURVEYS_ENDPOINT}/?surveyId=${row.original.id.toString('base64')}`;
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={
            isPublic
              ? () => {
                  copyToClipboard(url);
                }
              : undefined
          }
          text={t(`survey.${isPublic ? 'isPublicTrue' : 'isPublicFalse'}`)}
          textOnHover={isPublic ? t('common.copy.link') : ''}
          icon={
            isPublic ? (
              <PiEyeLight
                width={iconSize}
                height={iconSize}
              />
            ) : (
              <PiEyeSlash
                width={iconSize}
                height={iconSize}
              />
            )
          }
        />
      );
    },
  },
  {
    id: 'surveys-invited-attendees',
    header: ({ column }) => (
      <SortableHeader<SurveyDto, unknown>
        className={hideOnMobileClassName}
        column={column}
      />
    ),
    meta: {
      translationId: 'survey.invitedAttendees',
    },
    accessorFn: (row) => row.invitedAttendees.length,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { length } = row.original.invitedAttendees;
      const attendeeCount = length;
      const attendeeText = `${attendeeCount} ${t(attendeeCount === 1 ? 'survey.attendee' : 'survey.attendees')}`;
      const groupsCount = row.original.invitedGroups?.length;
      const groupsText = `${groupsCount ? `, ${groupsCount} ${t(groupsCount === 1 ? 'common.group' : 'common.groups')}` : ''}`;
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          text={`${attendeeText} ${groupsText}`}
        />
      );
    },
  },
  {
    id: 'participated',
    accessorKey: 'participatedAttendees',
    enableSorting: true,
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'common.participated',
    },
    cell: ({ row }) => {
      const { onClickSurveysTableCell } = useSurveyTablesPageStore();
      return (
        <ButtonSH
          onClick={() => onClickSurveysTableCell(row)}
          className="hidden h-full w-full lg:flex"
        >
          <span className="flex justify-center font-medium">{row.original?.participatedAttendees.length || 0}</span>
        </ButtonSH>
      );
    },
    sortingFn: (rowA, rowB) => sortSurveyByInvitesAndParticipation(rowA.original, rowB.original),
  },
];

export default SurveyTableColumns;
