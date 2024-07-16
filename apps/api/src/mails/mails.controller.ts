import {FetchMessageObject, ImapFlow, MailboxLockObject} from 'imapflow';
import { Controller, Get, Logger } from '@nestjs/common';
import MailDto from '@libs/dashboard/types/mail.dto';
import GetCurrentUsername from '../common/decorators/getUser.decorator';
// import MailsService from './mails.service';
import mockedMails from './mockedMails';

@Controller('mails')
class MailsController {
  // private clientIsAvailable: boolean = true;

  private client: ImapFlow | undefined;

  constructor(/*private readonly mailsService: MailsService*/) {}

  @Get()
  async update(@GetCurrentUsername() username: string) {
    let lock: MailboxLockObject | undefined;
    let mails: FetchMessageObject[] | MailDto[] = [];

    let newClient: ImapFlow | undefined;

    // if (this.clientIsAvailable && !this.client) {
    //   this.clientIsAvailable = false;

      try {
        newClient = new ImapFlow({
          verifyOnly: true,
          host: '172.22.1.1', // 'mail.schulung.multi.schule',
          port: 993,
          secure: true,
          auth: {
            user: username,
            pass: 'TestMuster123!',
          },
        });
        Logger.log('Created client prototype');
      } catch (err) {
        Logger.error('NotAbleToCreateImapClient');
        Logger.error(err);
        throw new Error('NotAbleToCreateImapClient')
      }

      try {
        Logger.log('Test Connection ...');
        await newClient?.connect();
        Logger.log('Successfully connected');
      } catch (err) {
        Logger.error('Not connected (error:)');
        Logger.error(err);
        throw new err;
      }

      Logger.log('Creating client ...');
      if (newClient?.authenticated) {
        this.client = new ImapFlow({
          host: 'mail.schulung.multi.schule',
          port: 993,
          secure: true,
          auth: {
            user: username,
            pass: 'TestMuster123!',
          },
        });
        Logger.log('Successfully created client');
      } else {
        throw new Error('NotAbleToAuthenticate');
      }

      // this.clientIsAvailable = true;
    // }

    // if (!this.clientIsAvailable) {
    //   Logger.error('Client is not available');
    //   throw new Error('Client is not available');
    // }

    try {
      // this.clientIsAvailable = false;
      await this.client?.connect();

      Logger.log('opening/locking inbox...');
      // Select and lock a mailbox. Throws if mailbox does not exist
      lock = await this.client?.getMailboxLock('INBOX');
      const messages: FetchMessageObject[] = [];

      // fetch latest message source
      // client.mailbox includes information about currently selected mailbox
      // "exists" value is also the largest sequence number available in the mailbox
      const message = await this.client?.fetchOne(
        typeof this.client?.mailbox === 'boolean' ? `${this.client?.mailbox}` : `${this.client?.mailbox.exists}`,
        { source: true },
      );
      Logger.log(message?.source.toString());

      // list subjects for all messages
      // uid value is always included in FETCH response, envelope strings are in unicode.
      const mails = this.client?.fetch('1:*', { envelope: true });
      for await (const msg of mails || []) {
        Logger.log(`${msg.uid}: ${msg.envelope.subject}`);
        messages.push(msg);
      }

      return messages;

    } catch (error) {
      Logger.log('Error while fetching mails', error);

      mails = mockedMails;

    } finally {
      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock?.release();

      this.client?.close();
      // this.clientIsAvailable = true;
    }
    return mails;
  }
}

export default MailsController;
