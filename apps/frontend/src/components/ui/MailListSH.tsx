import { ComponentProps } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

import cn from '@/lib/utils';
import Mail from '../../../../../libs/src/notification/types/mail';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { ScrollArea } from '@/components/ui/ScrollArea';

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

interface MailListSHProps {
  items: Mail[]
  useMail: any;
}

export function MailListSH({ items, useMail }: MailListSHProps) {
  const [mail, setMail] = useMail()

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              mail.selected === item.id && "bg-muted"
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
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  { formatDistanceToNow.formatDistanceToNow(
                      new Date(item.date),
                      {addSuffix: true}
                  ) }
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <BadgeSH key={label} variant={getBadgeVariantFromLabel(label)}>
                    {label}
                  </BadgeSH>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
