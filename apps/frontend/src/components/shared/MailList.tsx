import React, { ComponentProps } from 'react';
import cn from '@/lib/utils';
import MailDto from '@libs/dashboard/types/mail.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { BadgeSH } from '@/components/ui/BadgeSH';

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof BadgeSH>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default"
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline"
  }

  return "secondary"
}

interface MailListProps {
  items: MailDto[];
  className?: string;
}

const MailList = ({ items, className }: MailListProps) => {

  const renderLabelBadges = (item: MailDto) => {
    const shouldShowBadges = !!(item.labels?.size && item.labels.size > 0)

    const badges: React.ReactNode[] = []
    if (shouldShowBadges) {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const label in item.labels) {
        badges.push(
          <BadgeSH
            key={label}
            variant={getBadgeVariantFromLabel(label)}
          >
            {label}
          </BadgeSH>
        )
      }
    }

    return (
      shouldShowBadges && badges.length > 0
      ? (
        <div className="flex items-center gap-2">
          {badges}
        </div>
      ) : null
    )
  }

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto', className)}>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            type="button"
            key={item.messageId}
            className={cn(
              'w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.from?.value[0].name || item.from?.value[0].address}</div>
                  <span className="flex h-2 w-2 rounded-full bg-blue-600"/>
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">{item.text?.substring(0, 300)}</div>
            { renderLabelBadges(item) }
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

export default MailList;
