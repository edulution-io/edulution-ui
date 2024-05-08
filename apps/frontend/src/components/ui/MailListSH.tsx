import * as React from 'react';
import { ComponentProps } from 'react';
import { formatDistanceToNow } from 'date-fns';
import cn from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { Mail } from '@/components/ui/MailData';

export interface MailExtended extends Mail {
  selected: string;
}

interface MailListSHProps {
  items: MailExtended[];
  mail: MailExtended;
  setMail: (mail: MailExtended) => void;
}

const MailListSH = ({ items, mail, setMail }: MailListSHProps) => {
  const getBadgeVariantFromLabel = (label: string): ComponentProps<typeof Badge>['variant'] => {
    if (['work'].includes(label.toLowerCase())) {
      return 'default';
    }
    if (['personal'].includes(label.toLowerCase())) {
      return 'outline';
    }
    return 'secondary';
  };

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <ButtonSH
            key={item.id}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              mail.selected === item.id && 'bg-muted',
            )}
            onClick={() =>
              setMail({
                ...mail,
                selected: item.id,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {!item.read && <span className="flex h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <div
                  className={cn(
                    'ml-auto text-xs',
                    mail.selected === item.id ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {formatDistanceToNow(new Date(item.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">{item.text.substring(0, 300)}</div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge
                    key={label}
                    variant={getBadgeVariantFromLabel(label)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </ButtonSH>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MailListSH;
