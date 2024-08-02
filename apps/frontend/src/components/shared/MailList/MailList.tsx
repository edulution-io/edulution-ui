import React from 'react';
import { NavLink } from 'react-router-dom';
import cn from '@/lib/utils';
import { APPS } from '@libs/appconfig/types';
import MailDto from '@libs/dashboard/types/mail.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { getBadgeVariantFromLabel } from '@/components/shared/MailList/mail-list-get-badge-variant-from-label';

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
        key={`NavLink-${item.id}-BadgeSH-${label}`}
        variant={getBadgeVariantFromLabel(label)}
      >
        {label}
      </BadgeSH>
    ));

    return <div className="flex items-center gap-2">{badges}</div>;
  };

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto', className)}>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <NavLink
            to={`/${APPS.MAIL}`}
            key={`NavLink-${item.id}`}
            className={cn(
              'w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center gap-2 font-semibold">
                {item.from?.value[0].name || item.from?.value[0].address}
                <span className="flex h-2 w-2 rounded-full bg-ciLightGreen" />
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">{item.text?.substring(0, 300)}</div>
            {renderLabelBadges(item)}
          </NavLink>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MailList;
