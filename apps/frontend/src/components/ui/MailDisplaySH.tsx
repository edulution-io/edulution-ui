import * as React from 'react';
import { format, addDays, addHours, nextSaturday } from 'date-fns';
import { Archive, ArchiveX, Clock, Forward, MoreVertical, Reply, ReplyAll, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { Calendar } from '@/components/ui/Calendar';
import {
  DropdownMenuSH,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenuSH';
import Label from '@/components/ui/Label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import Separator from '@/components/ui/Separator';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

import { Mail } from '@/components/ui/MailData';

interface MailDisplayProps {
  mail: Mail | null;
}

const MailDisplaySH = ({ mail }: MailDisplayProps) => {
  const today = new Date();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonSH
                  variant="ghost"
                  size="icon"
                  disabled={!mail}
                >
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </ButtonSH>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonSH
                  variant="ghost"
                  size="icon"
                  disabled={!mail}
                >
                  <ArchiveX className="h-4 w-4" />
                  <span className="sr-only">Move to junk</span>
                </ButtonSH>
              </TooltipTrigger>
              <TooltipContent>Move to junk</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonSH
                  variant="ghost"
                  size="icon"
                  disabled={!mail}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Move to trash</span>
                </ButtonSH>
              </TooltipTrigger>
              <TooltipContent>Move to trash</TooltipContent>
            </Tooltip>
            <Separator
              orientation="vertical"
              className="mx-1 h-6"
            />
            <Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <ButtonSH
                      variant="ghost"
                      size="icon"
                      disabled={!mail}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="sr-only">Snooze</span>
                    </ButtonSH>
                  </TooltipTrigger>
                </PopoverTrigger>
                <PopoverContent className="flex w-[535px] p-0">
                  <div className="flex flex-col gap-2 border-r px-2 py-4">
                    <div className="px-4 text-sm font-medium">Snooze until</div>
                    <div className="grid min-w-[250px] gap-1">
                      <ButtonSH
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        Later today{' '}
                        <span className="ml-auto text-muted-foreground">{format(addHours(today, 4), 'E, h:m b')}</span>
                      </ButtonSH>
                      <ButtonSH
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        Tomorrow
                        <span className="ml-auto text-muted-foreground">{format(addDays(today, 1), 'E, h:m b')}</span>
                      </ButtonSH>
                      <ButtonSH
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        This weekend
                        <span className="ml-auto text-muted-foreground">{format(nextSaturday(today), 'E, h:m b')}</span>
                      </ButtonSH>
                      <ButtonSH
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        Next week
                        <span className="ml-auto text-muted-foreground">{format(addDays(today, 7), 'E, h:m b')}</span>
                      </ButtonSH>
                    </div>
                  </div>
                  <div className="p-2">
                    <Calendar />
                  </div>
                </PopoverContent>
              </Popover>
              <TooltipContent>Snooze</TooltipContent>
            </Tooltip>
          </div>
          {/* ICONS */}
          <div className="ml-auto flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonSH
                  variant="ghost"
                  size="icon"
                  disabled={!mail}
                >
                  <Reply className="h-4 w-4" />
                  <span className="sr-only">Reply</span>
                </ButtonSH>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonSH
                  variant="ghost"
                  size="icon"
                  disabled={!mail}
                >
                  <ReplyAll className="h-4 w-4" />
                  <span className="sr-only">Reply all</span>
                </ButtonSH>
              </TooltipTrigger>
              <TooltipContent>Reply all</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonSH
                  variant="ghost"
                  size="icon"
                  disabled={!mail}
                >
                  <Forward className="h-4 w-4" />
                  <span className="sr-only">Forward</span>
                </ButtonSH>
              </TooltipTrigger>
              <TooltipContent>Forward</TooltipContent>
            </Tooltip>
          </div>
          <Separator
            orientation="vertical"
            className="mx-2 h-6"
          />
          <DropdownMenuSH>
            <DropdownMenuTrigger asChild>
              <ButtonSH
                variant="ghost"
                size="icon"
                disabled={!mail}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
              </ButtonSH>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuSH>
        </TooltipProvider>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(' ')
                    .map((chunk: string) => chunk[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="ml-auto text-xs text-muted-foreground">{format(new Date(mail.date), 'PPpp')}</div>
            )}
          </div>
          <Separator />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">{mail.text}</div>
          <Separator className="mt-auto" />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                    <Switch
                      id="mute"
                      aria-label="Mute thread"
                    />{' '}
                    Mute this thread
                  </Label>
                  <ButtonSH
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Send
                  </ButtonSH>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">No message selected</div>
      )}
    </div>
  );
};

export default MailDisplaySH;
