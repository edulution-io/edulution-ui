import React from 'react';
import Conference from '@libs/conferences/types/conference.dto';
import cn from '@libs/common/utils/className';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';

interface ConferencesListProps {
  items: Conference[];
  className?: string;
}

const NUMBER_OF_BADGES_TO_SHOW = 2;

const ConferencesList = (props: ConferencesListProps) => {
  const { items, className } = props;

  const { joinConference } = useConferenceDetailsDialogStore();

  const getShownBadges = (item: Conference) => {
    const badges: React.ReactNode[] = [];
    for (let i = 0; i < Math.min(NUMBER_OF_BADGES_TO_SHOW, item.joinedAttendees.length); i += 1) {
      const name =
        item.joinedAttendees[i].label || `${item.joinedAttendees[i].firstName} ${item.joinedAttendees[i].lastName}`;

      badges.push(
        <BadgeSH
          className="max-w-[100px] hover:bg-ciLightBlue"
          key={`feed-conferences-${item.name}-badge-${name}`}
        >
          <p className="overflow-hidden text-ellipsis text-sm">{name}</p>
        </BadgeSH>,
      );
    }
    return badges;
  };

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto scrollbar-thin', className)}>
      <div className="flex flex-col gap-2 py-2 pt-0">
        {items.map((item) => (
          <Button
            key={item.meetingID}
            variant="btn-outline"
            type="button"
            className="h-10 max-h-16 w-full rounded-lg p-2"
            onClick={() => joinConference(item.meetingID)}
          >
            <span className="mb-1 flex w-full items-center justify-between font-semibold">
              {`${item.name}`}
              {item.isRunning && <span className="flex h-2 w-2 rounded-full bg-ciRed" />}
            </span>
            <span className="flex">
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
            </span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConferencesList;
