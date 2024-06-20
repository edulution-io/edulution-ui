import React from 'react';
import cn from '@/lib/utils';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import Attendee from '@/pages/ConferencePage/dto/attendee';

interface ConferencesListProps {
  items: Conference[];
  className?: string;
}

const ConferencesList = (props: ConferencesListProps) => {
  const { items, className } = props;

  const { joinConference } = useConferenceDetailsDialogStore();

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto', className)}>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.meetingID}
            type="button"
            className={cn(
              'w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent hover:opacity-60',
            )}
            onClick={() => joinConference(item.meetingID)}
          >
            <div className="flex items-center gap-2">
              <div className="font-semibold">{`${item.name}`}</div>
              {!!item.isRunning && <span className="flex h-2 w-2 rounded-full bg-red-600" />}
            </div>
            {item.joinedAttendees.length ? (
              <div className="flex items-center gap-2 rounded">
                {item.joinedAttendees.map((attendee: Attendee) => (
                  <BadgeSH key={attendee.label || attendee.username}>
                    <div className="text-xs">{attendee.label}</div>
                  </BadgeSH>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConferencesList;
