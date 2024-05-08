import { ImapFlow, MessageAddressObject } from 'imapflow';
import { Injectable } from '@nestjs/common';
import defaultImapFlowConfig from './imap-config';

const EMAIL_NOTIFICATION_BODY_MAX_LENGTH = 250;

interface Mail {
  subject: string;
  from: string[] | MessageAddressObject[];
  body: string;

  attachments?: any[];
  html?: string | false;
  date?: Date;
  priority?: 'normal' | 'low' | 'high';
  headerLines?: { key: string; line: string }[];
}

@Injectable()
class MailService {
  private client: ImapFlow | null = null;

  async fetchEmails() {
    this.client = new ImapFlow(defaultImapFlowConfig);

    try {
      await this.client.connect();

      const mailbox = await this.client.mailboxOpen('INBOX');
      const totalEmails = mailbox.exists;
      const fetchStart = Math.max(1, totalEmails - 9);

      const messages: Mail[] = [];
      // VALID FOR-LOOP: This for loop handles the data stream from the email server
      // eslint-disable-next-line no-restricted-syntax
      for await (const message of this.client.fetch(`${fetchStart || 1}:*`, { envelope: true, source: true })) {
        let body = message.source.toString();
        if (body.length > EMAIL_NOTIFICATION_BODY_MAX_LENGTH) {
          body = `${body.substring(0, EMAIL_NOTIFICATION_BODY_MAX_LENGTH)}...`;
        }
        messages.push({
          subject: message.envelope.subject,
          from: message.envelope.from,
          body,
        });
      }

      await this.client.logout();
      return messages;
    } catch (error) {
      throw new Error(`Failed to fetch Emails: ${error}`);
    }
  }

  async processEmails() {
    const emails = await this.fetchEmails();
    return emails;
  }
}

export default MailService;
