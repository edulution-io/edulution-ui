import { FetchMessageObject, ImapFlow } from 'imapflow';

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

  private checkImapConnection = async (username: string, host: string, port: number): Promise<boolean> => {
    this.client = new ImapFlow({
      host,
      port,
      secure: true,
      auth: {
        user: username,
        pass: 'Muster!',
      },
    });
    await this.client?.connect();
    const lock1 = await this.client?.getMailboxLock('INBOX');
    if (!this.client?.mailbox) {
      lock1.release();
      return true;
    }
    lock1.release();
    this.client = new ImapFlow({
      host,
      port,
      secure: true,
      auth: {
        user: username,
        pass: 'TestMuster123!',
      },
    });
    await this.client?.connect();
    const lock2 = await this.client?.getMailboxLock('INBOX');
    if (!this.client?.mailbox) {
      lock2.release();
      return true;
    }
    lock2.release();
    this.client = undefined;
    return false;
  };

  private initializeConnection = async (username: string): Promise<void> => {
    let success = false;
    success = await this.checkImapConnection(username, 'mail.schulung.multi.schule', 993);
    if (success) {
      console.log('Connection successful', 'mail.schulung.multi.schule', 993);
      return;
    }
    success = await this.checkImapConnection(username, 'mail.schulung.multi.schule', 143);
    if (success) {
      console.log('Connection successful', 'mail.schulung.multi.schule', 143);
      return;
    }
    success = await this.checkImapConnection(username, 'dovecat', 993);
    if (success) {
      console.log('Connection successful', 'dovecat', 993);
      return;
    }
    success = await this.checkImapConnection(username, 'mail.sgm-verwaltung.de', 143);
    if (success) {
      console.log('Connection successful', 'mail.sgm-verwaltung.de', 143);
      return;
    }
  };

  constructor(username: string) {
    this.initializeConnection(username);
  }

  public connect = async (): Promise<void> => {
    if (this.state !== ImapFlowState.CLOSED) {
      console.log('Already connected to IMAP');
      return;
    }

    console.log('connecting to IMAP ...');
    this.state = ImapFlowState.CONNECTING;
    try {
      await this.client?.connect();
      this.state = ImapFlowState.CONNECTED;
      console.log('connected to IMAP');
    } catch (err) {
      console.error('Error connecting to IMAP', err);
      this.state = ImapFlowState.CLOSED;
    }
  };

  public getMails = async (): Promise<FetchMessageObject[]> => {
    if (this.state !== ImapFlowState.READY && this.state !== ImapFlowState.CONNECTED) {
      console.log('Not ready to fetch emails');
      return Promise.reject(new Error('Not ready to fetch emails'));
    }

    console.log('opening/locking inbox...');
    // Select and lock a mailbox. Throws if mailbox does not exist
    const lock = await this.client?.getMailboxLock('INBOX');
    const messages: FetchMessageObject[] = [];

    try {
      // fetch latest message source
      // client.mailbox includes information about currently selected mailbox
      // "exists" value is also the largest sequence number available in the mailbox
      const message = await this.client?.fetchOne(
        typeof this.client?.mailbox === 'boolean' ? `${this.client?.mailbox}` : `${this.client?.mailbox.exists}`,
        { source: true },
      );
      console.log(message?.source.toString());

      // list subjects for all messages
      // uid value is always included in FETCH response, envelope strings are in unicode.
      const mails = this.client?.fetch('1:*', { envelope: true });
      for await (const msg of mails || []) {
        console.log(`${msg.uid}: ${msg.envelope.subject}`);
        messages.push(msg);
      }

      this.state = ImapFlowState.READY;

      // log out and close connection
      await this.client?.logout();

      this.state = ImapFlowState.CLOSED;

      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock?.release();

      return messages;
    } catch (err) {
      console.error(err);

      // log out and close connection
      await this.client?.logout();

      this.state = ImapFlowState.CLOSED;

      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock?.release();

      return Promise.reject(new Error('Not ready to fetch emails'));
    }
  };
}
