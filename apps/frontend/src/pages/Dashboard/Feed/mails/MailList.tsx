import React from 'react';
import { NavLink } from 'react-router-dom';
import cn from '@/lib/utils';
import APPS from '@libs/appconfig/constants/apps';
import MailDto from '@libs/mail/types/mail.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { BadgeSH } from '@/components/ui/BadgeSH';
import getBadgeVariantFromLabel from '@/pages/Dashboard/Feed/mails/getBadgeVariantFromLabel';

interface MailListProps {
  items: MailDto[];
  className?: string;
}

const MailList = ({ items, className }: MailListProps) => {
  const renderLabelBadges = (item: MailDto) => {
    if (!item.labels || item.labels.size === 0) {
      return null;
    }

    const badges = Array.from(item.labels).map((label) => (
      <BadgeSH
        key={`${item.id}-BadgeSH-${label}`}
        variant={getBadgeVariantFromLabel(label)}
      >
        {label}
      </BadgeSH>
    ));

    return <div className="flex items-center gap-2">{badges}</div>;
  };

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto scrollbar-thin', className)}>
      <div className="flex flex-col gap-2 py-2 pt-0">
        {items.map((item) => (
          <NavLink
            to={APPS.MAIL}
            key={item.id}
            className="w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-2 text-left transition-all hover:bg-ciDarkGrey"
          >
            <div className="flex w-full">
              <span className="text-sm font-semibold">{item.from?.value[0].name || item.from?.value[0].address}</span>
              <div className="relative mx-2">
                <p className="absolute h-2 w-2 rounded-full bg-ciLightGreen" />
              </div>
            </div>
            <p className="text-sm">{item.subject}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{item.text?.substring(0, 300)}</p>
            {renderLabelBadges(item)}
          </NavLink>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MailList;
