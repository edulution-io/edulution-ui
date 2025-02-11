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
import { ColumnDef } from '@tanstack/react-table';
import { LockClosedIcon } from '@radix-ui/react-icons';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { MdLogin, MdPending, MdPlayArrow, MdStop } from 'react-icons/md';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { useTranslation } from 'react-i18next';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import i18next from 'i18next';
import useUserStore from '@/store/UserStore/UserStore';
import { PiEyeLight, PiEyeSlash } from 'react-icons/pi';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import copyToClipboard from '@/utils/copyToClipboard';
import { toast } from 'sonner';
import delay from '@libs/common/utils/delay';

function getRowAction(isRunning: boolean, isLoading: boolean, isUserTheCreator: boolean) {
  if (isLoading) {
    return {
      icon: <MdPending />,
      text: i18next.t('common.loading'),
    };
  }
  if (isUserTheCreator) {
    if (isRunning) {
      return {
        icon: <MdStop />,
        text: i18next.t('conferences.stop'),
      };
    }
    return {
      icon: <MdPlayArrow />,
      text: i18next.t('conferences.start'),
    };
  }
  if (isRunning) {
    return {
      icon: <MdLogin />,
      text: i18next.t('conferences.join'),
    };
  }
  return { icon: undefined, text: '' };
}

const hideOnMobileClassName = 'hidden lg:flex min-w-24';

const ConferencesTableColumns: ColumnDef<ConferenceDto>[] = [
  {
    id: 'conference-name',
    header: ({ table, column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className="min-w-32"
        table={table}
        column={column}
      />
    ),

    meta: {
      translationId: 'conferences.conference',
    },

    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { user } = useUserStore();
      const { joinConference } = useConferenceDetailsDialogStore();
      const { isRunning, creator, name, meetingID } = row.original;
      const onClick = isRunning
        ? async () => {
            await joinConference(meetingID);
          }
        : undefined;
      return (
        <SelectableTextCell
          onClick={onClick}
          icon={isRunning ? <MdLogin /> : undefined}
          text={name}
          textOnHover={isRunning ? t('common.join') : ''}
          row={user?.username === creator?.username ? row : undefined}
          className="min-w-32"
          isFirstColumn
        />
      );
    },
  },
  {
    id: 'conference-creator',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        column={column}
      />
    ),
    meta: {
      translationId: 'conferences.creator',
    },
    accessorFn: (row) => row.creator,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { user } = useUserStore();
      const { firstName, username, lastName } = row.original.creator;
      const isUserTheCreator = user?.username === username;
      const { setSelectedConference } = useConferenceDetailsDialogStore();
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={
            isUserTheCreator
              ? () => {
                  setSelectedConference(row.original);
                }
              : undefined
          }
          text={`${firstName} ${lastName}`}
          textOnHover={isUserTheCreator ? t('common.details') : ''}
        />
      );
    },
  },
  {
    id: 'conference-isPublic',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        column={column}
      />
    ),
    meta: {
      translationId: 'conferences.isPublic',
    },
    accessorFn: (row) => row.isPublic,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const iconSize = 16;
      const { isPublic } = row.original;
      const url = `${window.location.origin}/${CONFERENCES_PUBLIC_EDU_API_ENDPOINT}/${row.original.meetingID}`;
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
          text={t(`conferences.${isPublic ? 'isPublicTrue' : 'isPublicFalse'}`)}
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
    id: 'conference-password',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        column={column}
      />
    ),
    meta: {
      translationId: 'conferences.password',
    },
    accessorFn: (row) => !!row.password,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const iconSize = 16;
      const { user } = useUserStore();
      const { setSelectedConference } = useConferenceDetailsDialogStore();
      const { username } = row.original.creator;
      const isUserTheCreator = user?.username === username;
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={
            isUserTheCreator
              ? () => {
                  setSelectedConference(row.original);
                }
              : undefined
          }
          text={'*'.repeat(row.original.password?.length || 0)}
          textOnHover={isUserTheCreator ? t('common.details') : ''}
          icon={
            row.original.password ? (
              <LockClosedIcon
                width={iconSize}
                height={iconSize}
              />
            ) : undefined
          }
        />
      );
    },
  },
  {
    id: 'conference-invited-attendees',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        column={column}
      />
    ),
    meta: {
      translationId: 'conferences.invitedAttendees',
    },
    accessorFn: (row) => row.invitedAttendees.length,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { user } = useUserStore();
      const { setSelectedConference } = useConferenceDetailsDialogStore();
      const isUserTheCreator = user?.username === row.original.creator.username;
      const { length } = row.original.invitedAttendees;
      const attendeeCount = length;
      const attendeeText = `${attendeeCount} ${t(attendeeCount === 1 ? 'conferences.attendee' : 'conferences.attendees')}`;
      const groupsCount = row.original.invitedGroups?.length;
      const groupsText = `${groupsCount ? `, ${groupsCount} ${t(groupsCount === 1 ? 'common.group' : 'common.groups')}` : ''}`;
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={
            isUserTheCreator
              ? () => {
                  setSelectedConference(row.original);
                }
              : undefined
          }
          text={`${attendeeText} ${groupsText}`}
          textOnHover={isUserTheCreator ? t('common.details') : ''}
        />
      );
    },
  },
  {
    id: 'conference-joined-attendees',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        column={column}
      />
    ),
    meta: {
      translationId: 'conferences.joinedAttendees',
    },
    accessorFn: (row) => row.joinedAttendees.length,
    cell: ({ row }) => (
      <SelectableTextCell
        className={hideOnMobileClassName}
        text={`${row.original.joinedAttendees.length || '-'}`}
      />
    ),
  },
  {
    id: 'conference-action-button',
    header: ({ column }) => <SortableHeader<ConferenceDto, unknown> column={column} />,
    meta: {
      translationId: 'conferences.action',
    },
    accessorFn: (row) => row.isRunning,
    cell: ({ row }) => {
      const { creator, isRunning, meetingID } = row.original;
      const { user } = useUserStore();
      const { joinConference, joinConferenceUrl, setJoinConferenceUrl } = useConferenceDetailsDialogStore();
      const { toggleConferenceRunningState, getConferences, loadingMeetingId } = useConferenceStore();
      const isUserTheCreator = user?.username === creator?.username;
      const isRowLoading = row.original.meetingID === loadingMeetingId;

      const { icon, text } = getRowAction(isRunning, isRowLoading, isUserTheCreator);

      const onClick =
        isRowLoading || !isUserTheCreator
          ? undefined
          : async () => {
              let wasConferenceStateToggled;
              if (isUserTheCreator) {
                wasConferenceStateToggled = await toggleConferenceRunningState(meetingID, isRunning);
                if (!isRunning) {
                  await joinConference(meetingID);
                } else if (joinConferenceUrl.includes(meetingID)) {
                  setJoinConferenceUrl('');
                }
              } else if (isRunning) {
                await joinConference(meetingID);
              }

              if (wasConferenceStateToggled) {
                await delay(5000);
                toast.info(i18next.t(`conferences.${isRunning ? 'stopped' : 'started'}`));
              } else {
                setJoinConferenceUrl('');
              }
              await getConferences();
            };
      return (
        <SelectableTextCell
          onClick={isUserTheCreator || isRunning ? onClick : undefined}
          icon={icon}
          text={text}
        />
      );
    },
  },
];

export default ConferencesTableColumns;
