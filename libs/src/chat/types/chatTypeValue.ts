import ChatType from '@libs/chat/types/chatType';

export type ChatTypeValue = (typeof ChatType)[keyof typeof ChatType];
