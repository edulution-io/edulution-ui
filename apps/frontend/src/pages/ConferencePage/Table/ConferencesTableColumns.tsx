import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { MdLogin, MdPending, MdPlayArrow, MdStop } from 'react-icons/md';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { useTranslation } from 'react-i18next';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import i18next from 'i18next';
import useUserStore from '@/store/UserStore/UserStore';
import { toast } from 'sonner';

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

const hideOnMobileClassName = 'hidden lg:flex';

const ConferencesTableColumns: ColumnDef<ConferenceDto>[] = [
  {
    id: 'conference-name',
    header: ({ table, column }) => (
      <SortableHeader<ConferenceDto, unknown>
        titleTranslationId="conferences.conference"
        table={table}
        column={column}
      />
    ),
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { user } = useUserStore();
      const { joinConference, setJoinConferenceUrl } = useConferenceDetailsDialogStore();
      const onClick = async () => {
        if (row.original.isRunning) {
          await joinConference(row.original.meetingID);
        } else {
          setJoinConferenceUrl('');
        }
      };
      return (
        <SelectableTextCell
          onClick={onClick}
          icon={row.original.isRunning ? <MdLogin /> : undefined}
          text={row.original.name}
          row={user?.username === row.original.creator?.username ? row : undefined}
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
        titleTranslationId="conferences.creator"
        column={column}
      />
    ),
    accessorFn: (row) => row.creator,
    cell: ({ row }) => {
      const { user } = useUserStore();
      const { setSelectedConference } = useConferenceDetailsDialogStore();
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={
            user?.username === row.original.creator?.username
              ? () => {
                  setSelectedConference(row.original);
                }
              : undefined
          }
          text={`${row.original.creator.firstName} ${row.original.creator.lastName}`}
        />
      );
    },
  },
  {
    id: 'conference-password',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        titleTranslationId="conferences.password"
        column={column}
      />
    ),
    accessorFn: (row) => row.creator,
    cell: ({ row }) => {
      const iconSize = 16;
      const { user } = useUserStore();
      const { setSelectedConference } = useConferenceDetailsDialogStore();
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={
            user?.username === row.original.creator?.username
              ? () => {
                  setSelectedConference(row.original);
                }
              : undefined
          }
          text={'*'.repeat(row.original.password?.length || 0)}
          icon={
            row.original.password ? (
              <LockClosedIcon
                width={iconSize}
                height={iconSize}
              />
            ) : (
              <LockOpen1Icon
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
    id: 'conference-invited-attendees',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        titleTranslationId="conferences.invitedAttendees"
        column={column}
      />
    ),
    accessorFn: (row) => row.invitedAttendees.length,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { user } = useUserStore();
      const { setSelectedConference } = useConferenceDetailsDialogStore();
      const attendeeCount = row.original.invitedAttendees.length;
      const attendeeText = `${attendeeCount} ${t(attendeeCount === 1 ? 'conferences.attendee' : 'conferences.attendees')}`;
      const groupsCount = row.original.invitedGroups?.length;
      const groupsText = `${groupsCount ? `, ${groupsCount} ${t(groupsCount === 1 ? 'common.group' : 'common.groups')}` : ''}`;
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={
            user?.username === row.original.creator?.username
              ? () => {
                  setSelectedConference(row.original);
                }
              : undefined
          }
          text={`${attendeeText} ${groupsText}`}
        />
      );
    },
  },
  {
    id: 'conference-joined-attendees',
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        className={hideOnMobileClassName}
        titleTranslationId="conferences.joinedAttendees"
        column={column}
      />
    ),
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
    header: ({ column }) => (
      <SortableHeader<ConferenceDto, unknown>
        titleTranslationId="conferences.action"
        column={column}
      />
    ),
    accessorFn: (row) => row.isRunning,
    cell: ({ row }) => {
      const { creator, isRunning, meetingID } = row.original;
      const { user } = useUserStore();
      const { joinConference, setJoinConferenceUrl, joinConferenceUrl } = useConferenceDetailsDialogStore();
      const { toggleConferenceRunningState, getConferences, loadingMeetingId } = useConferenceStore();
      const isUserTheCreator = user?.username === creator?.username;
      const isRowLoading = row.original.meetingID === loadingMeetingId;

      const { icon, text } = getRowAction(isRunning, isRowLoading, isUserTheCreator);

      const onClick =
        isRowLoading || !isUserTheCreator
          ? undefined
          : async () => {
              if (isUserTheCreator) {
                await toggleConferenceRunningState(meetingID, isRunning);
                if (!isRunning) {
                  await joinConference(meetingID);
                } else if (joinConferenceUrl.includes(meetingID)) {
                  setJoinConferenceUrl('');
                }
              } else if (isRunning) {
                await joinConference(meetingID);
              }
              await getConferences();
              toast.info(i18next.t(`conferences.${isRunning ? 'stopped' : 'started'}`));
            };
      return (
        <SelectableTextCell
          onClick={onClick}
          icon={icon}
          text={text}
        />
      );
    },
  },
];

export default ConferencesTableColumns;
