import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow';
import { Logger } from '@nestjs/common';
import MailDto from '@libs/dashboard/types/mail.dto';

enum ImapFlowState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  READY = 'ready',
  FETCHING = 'fetching',
  CLOSED = 'closed',
}

export default class ImapFlowGetMailsClient {
  private state: ImapFlowState = ImapFlowState.CLOSED;

  private client: ImapFlow | undefined;

  createClient(host: string, port: number, username: string, password: string): void {
    if (this.client) {
      Logger.log('Client already exists', ImapFlowGetMailsClient.name);
      return;
    }

    try {
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
      Logger.log('Successfully connected', ImapFlowGetMailsClient.name);
      this.state = ImapFlowState.READY;
    } catch (err) {
      // Do Nothing
      this.state = ImapFlowState.CLOSED;
      return;
    }
    this.client.on('error', (err: Error) => {
      Logger.log(`IMAP-Error: ${err.message}`, ImapFlowGetMailsClient.name);
    });
    this.client.on('close', () => {
      Logger.log('Imap Connection Closed', ImapFlowGetMailsClient.name);
      this.state = ImapFlowState.CLOSED;
    });
  }

  public connect = async (): Promise<void> => {
    if (!this.client) {
      this.state = ImapFlowState.CLOSED;
      throw new Error('No client to connect with');
    }

    if (this.state !== ImapFlowState.READY) {
      Logger.log('IMAP is not ready', ImapFlowGetMailsClient.name);
      return;
    }

    Logger.log('connecting to IMAP ...', ImapFlowGetMailsClient.name);
    this.state = ImapFlowState.CONNECTING;
    try {
      await this.client.connect();
      Logger.log('connected to IMAP', ImapFlowGetMailsClient.name);
      this.state = ImapFlowState.CONNECTED;
    } catch (err) {
      throw new Error(`Unable to connect to IMAP \n ERROR: ${err}`);
    }
  };

  public getMails = async (): Promise<FetchMessageObject[] | MailDto[]> => {
    if (!this.client) {
      Logger.log('No client to fetch with', ImapFlowGetMailsClient.name);
      throw new Error('No client to fetch with');
    }

    if (this.state === ImapFlowState.READY) {
      try {
        await this.connect();
      } catch (err) {
        throw new Error(`Unable to re-connect to IMAP \n ERROR: ${err}`);
      }
    }

    if (this.state !== ImapFlowState.CONNECTED) {
      Logger.log('Not ready to fetch emails', ImapFlowGetMailsClient.name);
      throw new Error('Not ready to fetch emails');
    }

    this.state = ImapFlowState.FETCHING;
    let lock: MailboxLockObject | undefined;
    try {
      Logger.log('opening/locking inbox...', ImapFlowGetMailsClient.name);
      // Select and lock a mailbox. Throws if mailbox does not exist
      lock = await this.client.getMailboxLock('INBOX');

      // fetch latest message source
      // client.mailbox includes information about currently selected mailbox
      // "exists" value is also the largest sequence number available in the mailbox
      const message = await this.client.fetchOne(
        typeof this.client.mailbox === 'boolean' ? `${this.client.mailbox}` : `${this.client.mailbox.exists}`,
        { source: true },
      );
      Logger.log(message?.source.toString(), ImapFlowGetMailsClient.name);
    } catch (err) {
      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock?.release();

      throw new Error(`Unable to lock on to the INBOX \n ERROR: ${err}`);
    }

    const messages: FetchMessageObject[] = [];
    try {
      // list subjects for all messages
      // uid value is always included in FETCH response, envelope strings are in unicode.
      const mails = this.client.fetch('1:*', { uid: true, envelope: true }) || [];
      // for await (const msg of mails || []) {
      //   Logger.log(`${msg.uid}: ${msg.envelope.subject}`, ImapFlowGetMailsClient.name);
      //   messages.push(msg);
      // }
      if (Array.isArray(mails)) {
        mails.forEach((msg: FetchMessageObject) => {
          Logger.log(`${msg.uid}: ${msg.envelope.subject}`, ImapFlowGetMailsClient.name);
          messages.push(msg);
        });
      }
    } catch (err) {
      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock?.release();

      throw new Error(`Unable to retrieve the MAILS in INBOX \n ERROR: ${err}`);
    }

    // Make sure lock is released, otherwise next `getMailboxLock()` never returns
    lock?.release();

    Logger.log('Successfully fetched mails', ImapFlowGetMailsClient.name);
    Logger.log(`Mails:`, ImapFlowGetMailsClient.name);

    if (Array.isArray(messages)) {
      messages.forEach((msg: FetchMessageObject) => {
        Logger.log(`seq: ${msg.seq}`, ImapFlowGetMailsClient.name);
        Logger.log(`uid: ${msg.uid}`, ImapFlowGetMailsClient.name);
        Logger.log(`source: ${msg.source.toString()}`, ImapFlowGetMailsClient.name);
        Logger.log(`emailId: ${msg.emailId}`, ImapFlowGetMailsClient.name);
        Logger.log(`size: ${msg.size}`, ImapFlowGetMailsClient.name);
        Logger.log(`envelope: ${JSON.stringify(msg.envelope, null, 2)}`, ImapFlowGetMailsClient.name);
        Logger.log(`bodyStructure: ${JSON.stringify(msg.bodyStructure, null, 2)}`, ImapFlowGetMailsClient.name);
        Logger.log(`internalDate: ${msg.internalDate.toDateString()}`, ImapFlowGetMailsClient.name);
      });
    }

    return messages;
  };

  public disconnect = async (): Promise<void> => {
    if (!this.client) {
      throw new Error('No client to disconnect');
    }

    await this.client.logout();
    this.client.close();
  };
}
