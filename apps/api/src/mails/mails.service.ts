import { ImapFlow, MailboxLockObject } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { Injectable, Logger } from '@nestjs/common';
import MailDto from '@libs/dashboard/types/mail.dto';
import JwtUser from '@libs/user/types/jwt/jwtUser';

@Injectable()
class MailsService {
  async mailRoutine(user: JwtUser): Promise<MailDto[]> {
    Logger.log(`Getting mails for user ${user.preferred_username}`, MailsService.name);

    const host = 'localhost'; // 'mail.schulung.multi.schule';
    const port = 9994; // 993;
    const username = 'yukigrun';
    const password = 'DemoMuster!';

    return MailsService.fetchMails(host, port, username, password);
  }

  static async fetchMails(host: string, port: number, username: string, password: string): Promise<MailDto[]> {
    const client = new ImapFlow({
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
    client.on('init', () => {
      Logger.log('IMAP-Initialized', MailsService.name);
    });
    client.on('state', (state: string) => {
      Logger.log(`IMAP-State: ${state}`, MailsService.name);
    });
    client.on('error', (err: Error) => {
      Logger.log(`IMAP-Error: ${err.message}`, MailsService.name);
    });
    client.on('close', () => {
      Logger.log('IMAP-Closed', MailsService.name);
    });

    Logger.log('connecting...', MailsService.name);
    await client
      .connect()
      .then(() => {
        Logger.log('Successfully connected to IMAP', MailsService.name);
      })
      .catch((err) => {
        throw new Error(`Unable to connect to IMAP \n ERROR: ${err}`);
      });

    Logger.log('opening/locking inbox...', MailsService.name);
    const lock: MailboxLockObject = await client.getMailboxLock('INBOX');
    try {
      // fetch latest message source
      // client.mailbox includes information about currently selected mailbox
      // "exists" value is also the largest sequence number available in the mailbox
      const message = await client.fetchOne(
        typeof client.mailbox === 'boolean' ? `${client.mailbox}` : `${client.mailbox.exists}`,
        { source: true },
      );
      Logger.log(
        `Successfully locked source: ${message.source ? message.source.toString() : 'not-available'}`,
        MailsService.name,
      );

      Logger.log('fetching mails...', MailsService.name);
      const mails: MailDto[] = [];
      const fetchMail = client.fetch(
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
      await client.logout();
      client.close();

      return mails;
    } catch (err) {
      throw new Error(`Unable to lock INBOX to retrieve the mails \n ERROR: ${err}`);
    } finally {
      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock?.release();
    }
  }
}

export default MailsService;
