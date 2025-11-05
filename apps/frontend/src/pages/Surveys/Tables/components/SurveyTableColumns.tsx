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
import i18n from '@/i18n';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import sortDate from '@libs/common/utils/Date/sortDate';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import sortSurveyByTitle from '@libs/survey/utils/sortSurveyByTitle';
import sortSurveyByInvitesAndParticipation from '@libs/survey/utils/sortSurveyByInvitesAndParticipation';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { useTranslation } from 'react-i18next';
import OpenShareQRDialogTextCell from '@/components/ui/Table/OpenShareQRDialogTextCell';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import hideOnMobileClassName from '@libs/ui/constants/hideOnMobileClassName';
import SURVEY_TABLE_COLUMNS from '@libs/survey/constants/surveyTableColumns';
import useLanguage from '@/hooks/useLanguage';

const SurveyTableColumns: ColumnDef<SurveyDto>[] = [
  {
    accessorKey: SURVEY_TABLE_COLUMNS.SELECT_SURVEY,
    enableSorting: true,
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'common.title',
    },
    cell: ({ row }) => (
      <SelectableTextCell
        row={row}
        text={row.original.formula.title || i18n.t('common.not-available')}
        className="h-full w-full"
        onClick={() => row.toggleSelected()}
      />
    ),
    accessorFn: (row) => row.formula.title,
    sortingFn: (rowA, rowB) => sortSurveyByTitle(rowA.original, rowB.original),
  },
  {
    accessorKey: SURVEY_TABLE_COLUMNS.CREATED_AT,
    size: 130,
    enableSorting: true,
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'survey.creationDate',
    },
    cell: ({ row }) => {
      const { language } = useLanguage();
      const localDateFormat = getLocaleDateFormat(language);
      const text = row.original?.createdAt
        ? format(row.original.createdAt, 'PPP', { locale: localDateFormat })
        : i18n.t('common.not-available');
      return (
        <SelectableTextCell
          text={text}
          className="h-full w-full"
          onClick={() => row.toggleSelected()}
        />
      );
    },
    sortingFn: (rowA, rowB) => sortDate(rowA.original.createdAt, rowB.original.createdAt),
  },
  {
    accessorKey: SURVEY_TABLE_COLUMNS.EXPIRES,
    size: 130,
    enableSorting: true,
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'survey.expirationDate',
    },
    cell: ({ row }) => {
      const { language } = useLanguage();
      const localDateFormat = getLocaleDateFormat(language);
      const text = row.original?.expires
        ? format(row.original.expires, 'PPP', { locale: localDateFormat })
        : i18n.t('common.not-available');
      return (
        <SelectableTextCell
          text={text}
          className="h-full w-full"
          onClick={() => row.toggleSelected()}
        />
      );
    },
    sortingFn: (rowA, rowB) => sortDate(rowA.original.expires, rowB.original.expires),
  },
  {
    accessorKey: SURVEY_TABLE_COLUMNS.IS_PUBLIC,
    size: 120,
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
      const iconSize = 16;
      const { isPublic } = row.original;
      const { setIsOpenSharePublicSurveyDialog } = useSurveyEditorPageStore();
      return (
        <OpenShareQRDialogTextCell
          openDialog={() => row.original.id && setIsOpenSharePublicSurveyDialog(true, row.original.id)}
          iconSize={iconSize}
          isPublic={!!isPublic}
          textTranslationId="survey"
        />
      );
    },
  },
  {
    accessorKey: SURVEY_TABLE_COLUMNS.INVITED_ATTENDEES,
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
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
          text={`${attendeeText}${groupsText}`}
          onClick={() => row.toggleSelected()}
        />
      );
    },
  },
  {
    accessorKey: SURVEY_TABLE_COLUMNS.ANSWERS,
    size: 85,
    enableSorting: true,
    header: ({ column }) => <SortableHeader<SurveyDto, unknown> column={column} />,
    meta: {
      translationId: 'common.answers',
    },
    cell: ({ row }) => (
      <SelectableTextCell
        text={`${row.original?.answers.length || 0}`}
        className="h-full w-full"
        onClick={() => row.toggleSelected()}
      />
    ),
    sortingFn: (rowA, rowB) => sortSurveyByInvitesAndParticipation(rowA.original, rowB.original),
  },
];

export default SurveyTableColumns;
