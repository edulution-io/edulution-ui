import React from 'react';
import cn from '@/lib/utils';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import Conference from '@libs/conferences/types/conference.dto';

interface ConferencesListProps {
  items: Conference[];
  className?: string;
}

const NUMBER_OF_BADGES_TO_SHOW = 2;

const ConferencesList = (props: ConferencesListProps) => {
  const { items, className } = props;

  const { joinConference } = useConferenceDetailsDialogStore();

  const getShownBadges = (item: Conference) => {
    const badges = [];
    for (let i = 0; i < Math.min(NUMBER_OF_BADGES_TO_SHOW, item.joinedAttendees.length); i += 1) {
      const name =
        item.joinedAttendees[i].label || `${item.joinedAttendees[i].firstName} ${item.joinedAttendees[i].lastName}`;

      badges.push(
        <BadgeSH
          className="max-w-[100px] hover:bg-ciLightBlue"
          key={`feed-conferences-${item.name}-badge-${name}`}
        >
          <div className="overflow-hidden text-ellipsis text-xs">{name}</div>
        </BadgeSH>,
      );
    }
    return badges;
  };

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto', className)}>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <Button
            key={item.meetingID}
            variant="btn-outline"
            type="button"
            className="w-full"
            onClick={() => joinConference(item.meetingID)}
          >
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between gap-2 font-semibold">
                {`${item.name}`}
                {item.isRunning && <span className="flex h-2 w-2 rounded-full bg-ciRed" />}
              </div>
              <div className="flex gap-2">
                {item.joinedAttendees.length > 0 ? (
                  <div className="flex items-center gap-2 rounded">{getShownBadges(item)}</div>
                ) : null}
                {item.joinedAttendees.length > NUMBER_OF_BADGES_TO_SHOW ? (
                  <BadgeSH
                    key={`feed-conferences-${item.name}-badge-remaining-attendees`}
                    className="text-xs hover:bg-ciLightBlue"
                  >
                    +{item.joinedAttendees.length - NUMBER_OF_BADGES_TO_SHOW}
                  </BadgeSH>
                ) : null}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConferencesList;
