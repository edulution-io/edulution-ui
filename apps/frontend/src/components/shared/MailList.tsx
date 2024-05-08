import React, { ComponentProps } from 'react';
// import { formatDistanceToNow } from 'date-fns';

import cn from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';

import { Mail, getName } from '@/pages/Home/EmailWidget/mail-type';
import { Button } from '@/components/shared/Button';

interface MailListProps {
  items: Mail[];
  selected: Mail | undefined;
  changeSelectionOnClick: (mail: Mail) => void;
}

const MailList = (props: MailListProps) => {
  const { items, selected, changeSelectionOnClick } = props;

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
        {items.map((mail: Mail) => (
          <Button
            key={mail.uid}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              [{ 'bg-muted': selected?.uid === mail.uid }],
            )}
            onClick={() => changeSelectionOnClick(mail)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{getName(mail)}</div>
                  {!mail.body && <span className="flex h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                {/* <div */}
                {/*   className={cn( */}
                {/*     "ml-auto text-xs", */}
                {/*     [ */}
                {/*       { "text-foreground": selected?.uid === mail.uid }, */}
                {/*       { "text-muted-foreground": selected?.uid !== mail.uid } */}
                {/*     ] */}
                {/*   )} */}
                {/* > */}
                {/*   {formatDistanceToNow(new Date(mail.date), { */}
                {/*     addSuffix: true, */}
                {/*   })} */}
                {/* </div> */}
              </div>
              <div className="text-xs font-medium">{mail.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">{mail.body.substring(0, 300)}</div>
            {mail.labels?.length ? (
              <div className="flex items-center gap-2">
                {mail.labels.map((label) => (
                  <Badge
                    key={label}
                    variant={getBadgeVariantFromLabel(label)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MailList;
