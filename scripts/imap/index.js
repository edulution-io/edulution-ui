import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { defaultImapConfig } from "@/components/feature/Mail/imap-config.js";

export const getEmails = () => {
  try {
    const mails = [];
    const imap = new Imap(defaultImapConfig);
    console.log('Connecting to the mailbox...');
    imap.once('ready', () => {
      console.log('opening inbox...')
      imap.openBox('INBOX', false, () => {
        console.log('searching for unread emails...')
        imap.search([ [ 'ALL' ], [ 'SINCE', new Date() ], ], (err, results) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log('fetching emails to get the message (body, attributes) ...')
          const f = imap.fetch(results, {bodies: ''});
          f.on('message', msg => {
            msg.on('body', stream => {
              if (stream) {
                simpleParser(stream, async (err, parsed) => {
                  console.log(parsed);
                  /* Make API call to save the data
                  Save the retrieved data into a database.
                  E.t.c
                  */
                  const { from } = parsed;
                  mails.push(
                    { from }
                  )
                });
              }
            });
            msg.once('attributes', attrs => {
              const {uid} = attrs;
              imap.addFlags(uid, ['\\Seen'], () => {
                // Mark the email as read after reading it
                console.log('Marked as read!');
              });
            });
          });
          f.once('error', ex => {
          //   return Promise.reject(ex);
            return {};
          });
          f.once('end', () => {
            console.log('Done fetching all messages!');
            imap.end();
          });
        });
      });
    });

    imap.once('error', err => {
        console.log(err);
    });

    imap.once('end', () => {
        console.log('Connection ended');
    });

    console.log('Connecting to the imap client...');
    imap.connect();

    return mails;

  } catch (ex) {
    console.log('an error occurred');
  }
};

getEmails();

