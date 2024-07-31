import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { HttpStatus, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import ImapErrorMessages from '@libs/dashboard/constants/imap-error-messages';
import MailDto from '@libs/dashboard/types/mail.dto';

const imapFetchMails = async (username: string, password: string): Promise<MailDto[]> => {
  // TODO: NIEDUUI-348: Migrate this settings to AppConfigPage (set imap settings in mails app config)
  const { MAIL_IMAP_URL, MAIL_IMAP_PORT, MAIL_IMAP_SECURE, MAIL_IMAP_TLS_REJECT_UNAUTHORIZED } = process.env;

  if (!MAIL_IMAP_URL || !MAIL_IMAP_PORT) {
    throw new CustomHttpException(
      CommonErrorMessages.NotAbleToReadEnvironmentVariablesError,
      HttpStatus.FAILED_DEPENDENCY,
    );
  }
  if (Number.isNaN(Number(MAIL_IMAP_PORT))) {
    throw new CustomHttpException(ImapErrorMessages.NotValidPortTypeError, HttpStatus.BAD_REQUEST);
  }

  const client = new ImapFlow({
    host: MAIL_IMAP_URL,
    port: Number(MAIL_IMAP_URL),
    secure: MAIL_IMAP_SECURE === 'true',
    tls: {
      rejectUnauthorized: MAIL_IMAP_TLS_REJECT_UNAUTHORIZED === 'true',
    },
    auth: {
      user: username,
      pass: password,
    },
    logger: false,
  });
  client.on('error', (err: Error): void => {
    Logger.error(`IMAP-Error: ${err.message}`, 'IMAP-FetchMails');
    void client.logout().then(() => client.close());
  });

  await client.connect().catch((err) => {
    throw new CustomHttpException(ImapErrorMessages.NotAbleToConnectClientError, HttpStatus.INTERNAL_SERVER_ERROR, err);
  });

  const lock: MailboxLockObject = await client.getMailboxLock('INBOX').catch((err) => {
    throw new CustomHttpException(ImapErrorMessages.NotAbleToLockMailboxError, HttpStatus.INTERNAL_SERVER_ERROR, err);
  });

  await client
    .fetchOne(typeof client.mailbox === 'boolean' ? `${client.mailbox}` : `${client.mailbox.exists}`, { source: true })
    .catch((err) => {
      throw new CustomHttpException(ImapErrorMessages.NotAbleToLockMailboxError, HttpStatus.INTERNAL_SERVER_ERROR, err);
    });

  const mails: MailDto[] = [];
  try {
    const fetchMail: AsyncGenerator<FetchMessageObject> = client.fetch(
      '1:*', // { or: [{ new: true }, { seen: false }, { recent: true }] },
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
  } catch (err) {
    throw new CustomHttpException(ImapErrorMessages.NotAbleToFetchMailsError, HttpStatus.INTERNAL_SERVER_ERROR, err);
  }

  lock?.release();
  await client.logout();
  client.close();

  Logger.log(`Successfully fetched ${mails.length} mails`, 'IMAP-FetchMails');
  if (mails.length === 0) {
    throw new CustomHttpException(ImapErrorMessages.NotAbleToFetchMailsError, HttpStatus.NOT_FOUND);
  }

  return mails;
};

export default imapFetchMails;
