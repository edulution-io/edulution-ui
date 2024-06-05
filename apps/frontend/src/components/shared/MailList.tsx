import React, { ComponentProps } from 'react';
import cn from '@/lib/utils';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { ScrollArea } from '@/components/ui/ScrollArea';
import Mail from '@/components/feature/Home/Notifications/components/types/mail.ts';

function getBadgeVariantFromLabel(label: string): ComponentProps<typeof BadgeSH>['variant'] {
  if (['work'].includes(label.toLowerCase())) {
    return 'default';
  }

  if (['personal'].includes(label.toLowerCase())) {
    return 'outline';
  }

  return 'secondary';
}

interface MailListProps {
  items: Mail[];
  className?: string;
}

export function MailList({ items, className }: MailListProps) {
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
            key={item.id}
            className={cn(
              'w-[300px] flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {!item.read && <span className="flex h-2 w-2 rounded-full bg-blue-600" />}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">{item.text.substring(0, 300)}</div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label: string) => (
                  <BadgeSH
                    key={label}
                    variant={getBadgeVariantFromLabel(label)}
                  >
                    <div className="text-xs">
                      {label}
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
