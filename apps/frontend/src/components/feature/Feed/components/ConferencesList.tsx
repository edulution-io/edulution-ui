import React from 'react';
import cn from '@/lib/utils';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import Conference from '@/pages/ConferencePage/dto/conference.dto';

interface ConferencesListProps {
  items: Conference[];
  className?: string;
}

const NUMBER_OF_BADGES_TO_SHOW = 2;

const ConferencesList = (props: ConferencesListProps) => {
  const { items, className } = props;

  const { joinConference } = useConferenceDetailsDialogStore();

  const getFirstXBadges = (item: Conference) => {
    const badges = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < Math.min(NUMBER_OF_BADGES_TO_SHOW, item.joinedAttendees.length); i++) {
      const name = item.joinedAttendees[i].label
        || `${item.joinedAttendees[i].firstName} ${item.joinedAttendees[i].lastName}`
        || item.joinedAttendees[i].username;
      badges.push(
        <BadgeSH className="max-w-[100px] hover:bg-ciLightBlue" key={`feed-conferences-${item.name}-badge-${name}`}>
          <div className="text-xs text-ellipsis overflow-hidden">{name}</div>
        </BadgeSH>
      );
    }
    return badges;
  }

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto', className)}>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <Button
            key={`feed-conference-${item.meetingID}`}
            variant="btn-outline"
            className="w-full h-fit-content"
            onClick={() => joinConference(item.meetingID)}
          >
            <div className="w-full">
              <div className="flex justify-between font-semibold gap-2 mb-1">
                {`${item.name}`}
                {item.isRunning && <span className="flex h-2 w-2 rounded-full bg-ciRed" /> }
              </div>
              <div className="flex gap-2">
                { item.joinedAttendees.length > 0
                  ? ( <div className="flex items-center gap-2 rounded">{ getFirstXBadges(item) }</div> )
                  : null }
                { item.joinedAttendees.length > NUMBER_OF_BADGES_TO_SHOW
                  ? ( <BadgeSH key={`feed-conferences-${item.name}-badge-remaining-attendees`} className="text-xs hover:bg-ciLightBlue">
                    +{item.joinedAttendees.length - NUMBER_OF_BADGES_TO_SHOW}
                  </BadgeSH>)
                  : null }
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConferencesList;
