import React from 'react';
import cn from '@/lib/utils';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { ScrollArea } from '@/components/ui/ScrollArea';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import Attendee from "@/pages/ConferencePage/dto/attendee.ts";

interface ConferencesListProps {
  items: Conference[];
  className?: string;
}

export function ConferencesList({ items, className }: ConferencesListProps) {
  return (
    <ScrollArea
      className={cn(
        'max-h-[470px] overflow-y-scroll',
        className,
      )}
    >
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.meetingID}
            className={cn(
              'w-[300px] flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{`${item.name}`}</div>
                  {!!item.isRunning && <span className="flex h-2 w-2 rounded-full bg-red-600" />}
                </div>
              </div>
            </div>
            {item.joinedAttendees.length ? (
              <div className="flex items-center gap-2 rounded">
                {item.joinedAttendees.map((attendee: Attendee) => (
                  <BadgeSH
                    key={attendee.label || attendee.username}
                  >
                    <div className="text-xs">
                      {attendee.label}
                    </div>
                  </BadgeSH>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

export default ConferencesList;
