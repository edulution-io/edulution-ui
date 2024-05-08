import { MessageAddressObject } from 'imapflow';

export interface Mail {
  // FROM MessageEnvelopeObject
  date: Date;
  subject: string;
  messageId: string;
  inReplyTo: string;
  from: MessageAddressObject;
  sender: MessageAddressObject;
  replyTo: MessageAddressObject;
  to: MessageAddressObject[];
  cc: MessageAddressObject[];
  bcc: MessageAddressObject[];

  uid: number;
  body: string;

  // attachments?: any[];
  labels?: string[];
  html?: string | false;
  priority?: 'normal' | 'low' | 'high';
  headerLines?: { key: string; line: string }[];
}

export const getName = (mail: Mail | null): string => {
  if (mail?.replyTo?.name) {
    return mail?.replyTo?.name;
  }
  if (mail?.from?.name) {
    return mail?.from?.name;
  }
  if (mail?.sender?.name) {
    return mail?.sender?.name;
  }
  return 'Unknown';
};

export const getAddress = (mail: Mail | null) => {
  if (mail?.replyTo?.address) {
    return mail?.replyTo?.address;
  }
  if (mail?.from?.address) {
    return mail?.from?.address;
  }
  if (mail?.sender?.address) {
    return mail?.sender?.address;
  }
  return 'Unknown@unknown';
};
