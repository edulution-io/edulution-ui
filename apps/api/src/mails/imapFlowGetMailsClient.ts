import { ImapFlow, MailboxLockObject } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { Logger } from '@nestjs/common';
import MailDto from '@libs/dashboard/types/mail.dto';

export default class ImapFlowGetMailsClient {
  private client: ImapFlow | null = null;

  async fetchMails(host: string, port: number, username: string, password: string): Promise<MailDto[]> {
    if (this.client != null) {
      throw new Error('There is already an active client trying to fetch mails');
    }

    this.client = new ImapFlow({
      host,
      port,
      secure: true,
      tls: {
        rejectUnauthorized: false, // true,
      },
      auth: {
        user: username,
        pass: password,
      },
    });
    this.client.on('init', () => {
      Logger.log('IMAP-Initialized', ImapFlowGetMailsClient.name);
    });
    this.client.on('state', (state: string) => {
      Logger.log(`IMAP-State: ${state}`, ImapFlowGetMailsClient.name);
    });
    this.client.on('error', (err: Error) => {
      Logger.log(`IMAP-Error: ${err.message}`, ImapFlowGetMailsClient.name);
    });
    this.client.on('close', () => {
      Logger.log('IMAP-Closed', ImapFlowGetMailsClient.name);
    });

    Logger.log('connecting...', ImapFlowGetMailsClient.name);
    await this.client
      .connect()
      .then(() => {
        Logger.log('Successfully connected to IMAP', ImapFlowGetMailsClient.name);
      })
      .catch((err) => {
        throw new Error(`Unable to connect to IMAP \n ERROR: ${err}`);
      });

    Logger.log('opening/locking inbox...', ImapFlowGetMailsClient.name);
    const lock: MailboxLockObject = await this.client.getMailboxLock('INBOX');
    try {
      // fetch latest message source
      // client.mailbox includes information about currently selected mailbox
      // "exists" value is also the largest sequence number available in the mailbox
      const message = await this.client.fetchOne(
        typeof this.client.mailbox === 'boolean' ? `${this.client.mailbox}` : `${this.client.mailbox.exists}`,
        { source: true },
      );
      Logger.log(
        `Successfully locked source: ${message.source ? message.source.toString() : 'not-available'}`,
        ImapFlowGetMailsClient.name,
      );

      Logger.log('fetching mails...', ImapFlowGetMailsClient.name);
      const mails: MailDto[] = [];
      const fetchMail = this.client.fetch(
        { or: [{ new: true }, { seen: false }, { recent: true }] },
        {
          source: true,
          envelope: true,
          bodyStructure: true,
          flags: true,
          labels: true,
        },
      );

      // eslint-disable-next-line no-restricted-syntax
      for await (const mail of fetchMail || []) {
        const parsedMail: ParsedMail = await simpleParser(mail.source);
        const mailDto: MailDto = {
          ...parsedMail,
          flags: mail.flags,
          labels: mail.labels,
        };
        mails.push(mailDto);
      }

      lock?.release();
      await this.client.logout();
      this.client.close();

      return mails;
    } catch (err) {
      throw new Error(`Unable to lock INBOX to retrieve the mails \n ERROR: ${err}`);
    } finally {
      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock?.release();
      this.client = null;
    }
  }
}
