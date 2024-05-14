import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';
import { MdPending, MdPlayArrow, MdStop } from 'react-icons/md';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { useTranslation } from 'react-i18next';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import useUserStore from '@/store/userStore';
import { TFunction } from 'i18next';

function getRowAction(isRunning: boolean, isLoading: boolean, t: TFunction<'translation', undefined>) {
  if (isLoading) {
    return {
      icon: <MdPending />,
      text: t('common.loading'),
    };
  }
  if (isRunning) {
    return {
      icon: <MdStop />,
      text: t('conferences.stop'),
    };
  }
  return {
    icon: <MdPlayArrow />,
    text: t('conferences.start'),
  };
}

const ConferencesTableColumns: ColumnDef<Conference>[] = [
  {
    id: 'conference-name',
    header: ({ table, column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.name"
        table={table}
        column={column}
      />
    ),
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
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
          text={row.original.name}
          row={row}
        />
      );
    },
  },
  {
    id: 'conference-creator',
    header: ({ column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.creator"
        column={column}
      />
    ),
    accessorFn: (row) => row.creator,
    cell: ({ row }) => (
      <SelectableTextCell text={`${row.original.creator.firstName} ${row.original.creator.lastName}`} />
    ),
  },
  {
    id: 'conference-password',
    header: ({ column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.password"
        column={column}
      />
    ),
    accessorFn: (row) => row.creator,
    cell: ({ row }) => {
      const iconSize = 16;
      return (
        <SelectableTextCell
          text={row.original.password || ''}
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
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.invitedAttendees"
        column={column}
      />
    ),
    accessorFn: (row) => row.invitedAttendees.length,
    cell: ({ row }) => <SelectableTextCell text={`${row.original.invitedAttendees.length || '-'}`} />,
  },
  {
    id: 'conference-joined-attendees',
    header: ({ column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.joinedAttendees"
        column={column}
      />
    ),
    accessorFn: (row) => row.joinedAttendees.length,
    cell: ({ row }) => <SelectableTextCell text={`${row.original.joinedAttendees.length || '-'}`} />,
  },
  {
    id: 'conference-action-button',
    header: ({ column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.action"
        column={column}
      />
    ),
    accessorFn: (row) => row.isRunning,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { user } = useUserStore();
      if (user !== row.original.creator.username) {
        return null;
      }
      const { toggleConferenceRunningState, toggleConferenceRunningStateIsLoading: isLoading } = useConferenceStore();
      const { joinConference, setJoinConferenceUrl } = useConferenceDetailsDialogStore();
      const { icon, text } = getRowAction(row.original.isRunning, isLoading, t);
      const onClick = async () => {
        await toggleConferenceRunningState(row.original.meetingID);
        if (!row.original.isRunning) {
          await joinConference(row.original.meetingID);
        } else {
          setJoinConferenceUrl('');
        }
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
