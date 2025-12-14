import React from 'react';
import cn from '@libs/common/utils/className';
import Avatar from '@/components/shared/Avatar';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import AILogo from '@/components/shared/AILogo';
import ChatMessageData from '@libs/chat/types/chatMessageData';
import useAIChatStore from '@/pages/Chat/hooks/useAIChatStore';
import formatIsoDateToLocaleString from '@libs/common/utils/Date/formatIsoDateToLocaleString';

interface ChatMessageProps {
  message: ChatMessageData;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { aiConfig } = useAIChatStore();
  const { text, sender, timestamp, isOwn, isStreaming } = message;

  return (
    <div className={cn('flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {sender.isAI ? (
        <AILogo
          provider={aiConfig?.provider}
          size="sm"
        />
      ) : (
        <Avatar
          user={{
            username: sender.cn,
            firstName: sender.firstName,
            lastName: sender.lastName,
          }}
          className="h-8 w-8 flex-shrink-0"
        />
      )}

      <div className={cn('flex max-w-[80%] flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        <span className="text-xs font-medium text-muted-foreground">{sender.displayName || sender.cn}</span>

        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-accent/50 rounded-br-md border border-muted text-background'
              : 'rounded-bl-md bg-muted text-background',
            isStreaming && 'animate-pulse',
          )}
        >
          {sender.isAI ? (
            <MarkdownRenderer
              content={text}
              className="text-sm text-background"
            />
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm">{text}</p>
          )}
        </div>

        <span className="text-xs text-muted-foreground">{formatIsoDateToLocaleString(timestamp, true)}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
