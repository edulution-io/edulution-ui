// import { FetchMessageObject, ImapFlow } from 'imapflow';
// import { Logger } from '@nestjs/common';
//
// enum ImapFlowState {
//   CONNECTING = 'connecting',
//   CONNECTED = 'connected',
//   READY = 'ready',
//   FETCHING = 'fetching',
//   CLOSED = 'closed',
// }
//
// export default class ImapFlowGetMailsClient {
//   private client: ImapFlow | undefined;
//
//   constructor(username: string, host: string, port: number) {
//     Logger.log(`Test Connection:: host: ${host}; port: ${port}`);
//     try {
//       this.client = new ImapFlow({
//         verifyOnly: true,
//         host,
//         port,
//         secure: true,
//         servername: host,
//         auth: {
//           user: username,
//           pass: 'TestMuster123!',
//         },
//       });
//       Logger.log('Successfully connected');
//     } catch (err) {
//       // Do Nothing
//       return;
//     }
//     this.client.on('error', function(err) {
//       Logger.error(err);
//     });
//     this.client.on('close', () => {
//       Logger.log('Imap Connection Closed');
//       this.state = ImapFlowState.CLOSED;
//     });
//   }
//
//   public connect = async (): Promise<void> => {
//     if (this.state !== ImapFlowState.CLOSED) {
//       Logger.log('Already connected to IMAP');
//       return;
//     }
//
//     Logger.log('connecting to IMAP ...');
//     this.state = ImapFlowState.CONNECTING;
//     try {
//       await this.client?.connect();
//       Logger.log('connected to IMAP');
//       this.state = ImapFlowState.CONNECTED;
//     } catch (err) {
//       // Do Nothing
//     }
//   };
//
//   public getMails = async (): Promise<FetchMessageObject[]> => {
//     if (this.state !== ImapFlowState.READY && this.state !== ImapFlowState.CONNECTED) {
//       Logger.log('Not ready to fetch emails');
//       return Promise.reject(new Error('Not ready to fetch emails'));
//     }
//
//     Logger.log('opening/locking inbox...');
//     // Select and lock a mailbox. Throws if mailbox does not exist
//     const lock = await this.client?.getMailboxLock('INBOX');
//     const messages: FetchMessageObject[] = [];
//
//     try {
//       // fetch latest message source
//       // client.mailbox includes information about currently selected mailbox
//       // "exists" value is also the largest sequence number available in the mailbox
//       const message = await this.client?.fetchOne(
//         typeof this.client?.mailbox === 'boolean' ? `${this.client?.mailbox}` : `${this.client?.mailbox.exists}`,
//         { source: true },
//       );
//       Logger.log(message?.source.toString());
//
//       // list subjects for all messages
//       // uid value is always included in FETCH response, envelope strings are in unicode.
//       const mails = this.client?.fetch('1:*', { envelope: true });
//       for await (const msg of mails || []) {
//         Logger.log(`${msg.uid}: ${msg.envelope.subject}`);
//         messages.push(msg);
//       }
//
//       this.state = ImapFlowState.READY;
//
//       // Make sure lock is released, otherwise next `getMailboxLock()` never returns
//       lock?.release();
//
//       return messages;
//     } catch (err) {
//       // Do Nothing
//       return [];
//     }
//   };
//
//   public disconnect = async (): Promise<void> => {
//       await this.client?.logout();
//       this.client?.close();
//   };
// }
