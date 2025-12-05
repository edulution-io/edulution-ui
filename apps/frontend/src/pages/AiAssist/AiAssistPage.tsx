import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { CodeIcon, CopyIcon, GlobeIcon, PaperclipIcon, RefreshCcwIcon } from 'lucide-react';
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Loader } from '@/components/ai-elements/loader';
import useAvailableAiModels from '@/pages/AiAssist/hooks/useAvailableAiModels';
import useChatHistory from '@/pages/AiAssist/hooks/useChatHistory';
import AI_CONFIG_PURPOSES from '@libs/ai/constants/aiConfigPurposes';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import toUIMessages from '@libs/ai/utils/toUIMessages';
import { useParams } from 'react-router-dom';
import toAiChatMessages from '@libs/ai/utils/toAiChatMessages';

const AiAssistPage = () => {
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const { chatId } = useParams<{ chatId?: string }>();

  const {
    models,
    selectedModel,
    selectModelById,
    isLoading: modelsLoading,
  } = useAvailableAiModels({ purpose: AI_CONFIG_PURPOSES.CHAT });

  const { setSelectedChatId, selectedChatId, loadChat, createChat, updateChat } = useChatHistory();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/edu-api/ai/chat',
        body: {
          configId: selectedModel?.configId,
          webSearch,
          codeMode,
        },
      }),
    [selectedModel?.configId, webSearch, codeMode],
  );

  const { messages, sendMessage, status, regenerate, setMessages } = useChat({ transport });

  useEffect(() => {
    if (selectedChatId) {
      loadChat(selectedChatId).then((chat) => {
        if (chat?.messages) {
          setMessages(toUIMessages(chat.messages));
        }
      });
    } else {
      setMessages([]);
    }
  }, [selectedChatId, loadChat, setMessages]);

  useEffect(() => {
    if (messages.length > 0 && status === 'ready') {
      const firstMessage = messages[0];
      const firstTextPart = firstMessage?.parts?.find((part) => part.type === 'text');
      const title = firstTextPart && 'text' in firstTextPart ? firstTextPart.text.slice(0, 50) : 'Neuer Chat';

      const chatMessages = toAiChatMessages(messages);

      if (selectedChatId) {
        void updateChat(selectedChatId, chatMessages);
      } else {
        void createChat(title, chatMessages);
      }
    }
  }, [messages, status, selectedChatId, createChat, updateChat]);

  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
    } else {
      setSelectedChatId(null);
    }
  }, [chatId, setSelectedChatId]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;

    sendMessage(
      {
        text: message.text || 'Datei gesendet',
        files: message.files,
      },
      {
        body: {
          configId: selectedModel?.configId,
          webSearch,
          codeMode,
        },
      },
    );
    setInput('');
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Starte eine Konversation...</p>
            )}

            {messages.map((message, messageIndex) => (
              <div
                key={message.id}
                className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-background'
                  }`}
                >
                  {message.parts.map((part, partIndex) => {
                    if (part.type === 'text') {
                      return (
                        <div key={`${message.id}-${partIndex}`}>
                          {message.role === 'assistant' ? (
                            <MarkdownRenderer content={part.text} />
                          ) : (
                            <p className="whitespace-pre-wrap">{part.text}</p>
                          )}

                          {message.role === 'assistant' && messageIndex === messages.length - 1 && (
                            <div className="border-background/20 mt-2 flex gap-2 border-t pt-2">
                              <button
                                onClick={() => regenerate()}
                                className="text-background/70 hover:text-background"
                                title="Neu generieren"
                              >
                                <RefreshCcwIcon className="size-4" />
                              </button>
                              <button
                                onClick={() => navigator.clipboard.writeText(part.text)}
                                className="text-background/70 hover:text-background"
                                title="Kopieren"
                              >
                                <CopyIcon className="size-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {status === 'submitted' && (
              <div className="mb-6 flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <Loader />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="mx-auto max-w-3xl">
            <PromptInput
              onSubmit={handleSubmit}
              className="bg-muted/50 rounded-2xl border-0"
              globalDrop
              multiple
            >
              <PromptInputHeader>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
              </PromptInputHeader>

              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nachricht eingeben..."
                  className="placeholder:text-background/50 bg-transparent text-background"
                />
              </PromptInputBody>

              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu
                    trigger={<PaperclipIcon size={16} />}
                    items={[{ label: 'Datei hinzufügen', onClick: () => {} }]}
                  />

                  <PromptInputButton
                    variant={webSearch ? 'default' : 'ghost'}
                    onClick={() => setWebSearch(!webSearch)}
                  >
                    <GlobeIcon size={16} />
                    <span>Suche</span>
                  </PromptInputButton>

                  <PromptInputButton
                    variant={codeMode ? 'default' : 'ghost'}
                    onClick={() => setCodeMode(!codeMode)}
                  >
                    <CodeIcon size={16} />
                    <span>Code</span>
                  </PromptInputButton>

                  <PromptInputSelect
                    value={selectedModel?.configId || ''}
                    onValueChange={selectModelById}
                    disabled={modelsLoading || status === 'streaming'}
                  >
                    <PromptInputSelectTrigger className="w-[200px]">
                      <PromptInputSelectValue placeholder="Modell wählen..." />
                    </PromptInputSelectTrigger>
                    <PromptInputSelectContent>
                      {models.map((model) => (
                        <PromptInputSelectItem
                          key={model.configId}
                          value={model.configId}
                        >
                          {model.name}
                        </PromptInputSelectItem>
                      ))}
                    </PromptInputSelectContent>
                  </PromptInputSelect>
                </PromptInputTools>

                <PromptInputSubmit
                  disabled={!input.trim()}
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistPage;
