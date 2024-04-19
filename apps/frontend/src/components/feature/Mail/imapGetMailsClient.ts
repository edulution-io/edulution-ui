import Imap, { Config, ImapMessage } from 'imap';
import { ParsedMail, simpleParser, Source } from 'mailparser';

enum ImapState {
  CONNECTING = 'connecting',
  READY = 'ready',
  FETCHING = 'fetching',
  CLOSED = 'closed',
}

export default class ImapGetMailsClient {
  private imap: Imap;

  private mails: string = '';

  private state: ImapState = ImapState.CLOSED;

  constructor(config?: Config) {
    const imapConfig = {
      user: config?.user || '',
      password: config?.password || '',
      host: config?.host || '',
      port: config?.port || 993,
      tls: config?.tls || true,
      tlsOptions: config?.tlsOptions,
    };

    this.imap = new Imap({ ...imapConfig });

    this.imap.once('error', (err: Error) => {
      console.log('IMAP connection had ERROR');
      console.log(err);
    });

    this.imap.once('end', () => {
      console.log('IMAP connection has ENDED');
    });

    this.imap.once('ready', () => {
      console.log('IMAP connection is READY');
      this.state = ImapState.READY;
    });
  }

  public connect = (): void => {
    console.log('connecting to IMAP ..');
    this.state = ImapState.CONNECTING;
    this.imap.connect();
  };

  private fetchMailsMatchingCriteria = (uids: number[]): void => {
    console.log('fetching the emails that fit the criteria to get the message (body, attributes) ...');
    const f = this.imap.fetch(uids, { bodies: '' });

    f.once('error', (error: Error) => console.log(error));

    f.on('message', (msg: ImapMessage) => {
      msg.on('body', (stream: Source) => {
        if (stream != null) {
          simpleParser(stream, (mail: ParsedMail) => {
            console.log(mail);
            const { from } = mail;
            if (from) {
              this.mails = this.mails.concat(JSON.stringify(from, null, 2));
            }
          });
        }
      });
      // msg.once('attributes', attrs => {
      //   const {uid} = attrs;
      //   this.imap.addFlags(uid, ['\\Seen'], () => {
      //     // Mark the email as read after reading it
      //     console.log('Marked as read!');
      //   });
      // });
    });
  };

  public reconnect = (): void => {
    this.close();
    this.connect();
  };

  public retry = async (): Promise<string> => {
    // eslint-disable-next-line
    await 1000;
    return this.getMails();
  };

  public getMails = async (): Promise<string> => {
    if (this.state === ImapState.FETCHING) {
      throw new Error('Already fetching emails');
    }
    if (this.state === ImapState.CLOSED) {
      this.connect();
    }
    if (this.state !== ImapState.READY) {
      return this.retry();
    }

    this.state = ImapState.FETCHING;

    try {
      console.log('opening inbox...');
      this.imap.openBox('INBOX', false, () => {
        console.log('check if any email fits the criteria...');
        this.imap.search([['ALL'], ['SINCE', new Date()]], (error: Error, uids: number[]) => {
          if (error) {
            console.error('Error searching email', error);
            return;
          }
          this.fetchMailsMatchingCriteria(uids);
        });
      });

      this.state = ImapState.READY;

      return `[ ${this.mails} ]`;
    } catch (error) {
      console.error('Error fetching email', error);
      this.mails = '';
      this.close();
      return '';
    }
  };

  public close = (): void => {
    console.log('closing IMAP ..');

    this.imap.end();
    this.state = ImapState.CLOSED;
  };
}
