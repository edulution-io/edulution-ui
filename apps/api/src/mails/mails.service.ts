// import { MailboxLockObject, FetchMessageObject, ImapFlow } from 'imapflow';
// import { Injectable, Logger } from '@nestjs/common';
//
// @Injectable()
// class MailsService {
//   constructor() {}
//
//   async createClient(username: string, host: string, port: number) {
//     return new ImapFlow({
//       verifyOnly: true,
//       host,
//       port,
//       secure: true,
//       auth: {
//         user: username,
//         pass: 'TestMuster123!',
//       },
//     });
//   }
//
//   async getMails(client: ImapFlow): Promise<FetchMessageObject[]> {
//     let lock: MailboxLockObject | undefined;
//     let mails: FetchMessageObject[] = [];
//     try {
//       await client.connect();
//
//       Logger.log('opening/locking inbox...');
//       // Select and lock a mailbox. Throws if mailbox does not exist
//       lock = await client?.getMailboxLock('INBOX');
//       const messages: FetchMessageObject[] = [];
//
//
//       // fetch latest message source
//       // client.mailbox includes information about currently selected mailbox
//       // "exists" value is also the largest sequence number available in the mailbox
//       const message = await client?.fetchOne(
//         typeof client?.mailbox === 'boolean' ? `${client?.mailbox}` : `${client?.mailbox.exists}`,
//         { source: true },
//       );
//       Logger.log(message?.source.toString());
//
//       // list subjects for all messages
//       // uid value is always included in FETCH response, envelope strings are in unicode.
//       const mails = client?.fetch('1:*', { envelope: true });
//       for await (const msg of mails || []) {
//         Logger.log(`${msg.uid}: ${msg.envelope.subject}`);
//         messages.push(msg);
//       }
//
//       return messages;
//
//     } finally {
//       // Make sure lock is released, otherwise next `getMailboxLock()` never returns
//       lock?.release();
//
//       await client.close();
//     }
//     return mails;
//   }
//
//   // async getMails(username: string): Promise<FetchMessageObject[]> {
//   //
//   //   // HOSTS
//   //   // mail.schulung.multi.schule <- MAILCOW CONFIG
//   //   // PORTS
//   //   // 80 <- CONFIG HTTP_PORT
//   //   // 443 <- CONFIG HTTPS_PORT
//   //   // 143 <- CONFIG IMAP_PORT
//   //   // 993 <- CONFIG IMAPS_PORT
//   //
//   //   // DOVECOT IMAP SERVER
//   //   // PORTS
//   //   // 10001 <- inet_listener auth-inet
//   //   // 0600 <- unix_listener auth-userdb (auth-master user: vmail)
//   //   // 10143 <- service imap-login - inet_listener imap_haproxy
//   //   // 10993 <- service imap-login - inet_listener imaps_haproxy
//   //
//   //   // nginx-mailcow:80
//   //   // dovecot:143
//   //
//   //
//   //   const ImapClient = new ImapFlowGetMailsClient(username, 'mail.schulung.multi.schule', 993);
//   //   await ImapClient.connect();
//   //   let mails: FetchMessageObject[] = [];
//   //   try {
//   //     mails = await ImapClient.getMails();
//   //     Logger.log(`mails: ${mails}`);
//   //   } catch (error) {
//   //     Logger.log(`mails (error) ${error}`);
//   //   } finally {
//   //     await ImapClient.disconnect();
//   //   }
//   //   return mails;
//   // }
// }
//
// export default MailsService;
