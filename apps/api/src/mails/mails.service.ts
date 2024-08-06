import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import MailsErrorMessages from '@libs/dashboard/feed/mails/constants/mails-error-messages';
import MailDto from '@libs/dashboard/feed/mails/types/mail.dto';

@Injectable()
class MailsService {
  static getMails = async (username: string, password: string): Promise<MailDto[]> => {
    // TODO: NIEDUUI-348: Migrate this settings to AppConfigPage (set imap settings in mails app config)
    const { MAIL_IMAP_URL, MAIL_IMAP_PORT, MAIL_IMAP_SECURE, MAIL_IMAP_TLS_REJECT_UNAUTHORIZED } = process.env;

    if (!MAIL_IMAP_URL || !MAIL_IMAP_PORT) {
      throw new CustomHttpException(CommonErrorMessages.EnvAccessError, HttpStatus.FAILED_DEPENDENCY);
    }
    if (Number.isNaN(Number(MAIL_IMAP_PORT))) {
      throw new CustomHttpException(MailsErrorMessages.NotValidPortTypeError, HttpStatus.BAD_REQUEST);
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
      Logger.error(`IMAP-Error: ${err.message}`, MailsService.name);
      void client.logout().then(() => client.close());
    });

    await client.connect().catch((err) => {
      throw new CustomHttpException(
        MailsErrorMessages.NotAbleToConnectClientError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        err,
      );
    });

    const mailboxLock: MailboxLockObject = await client.getMailboxLock('INBOX');
    const mails: MailDto[] = [];
    try {
      const fetchMail: AsyncGenerator<FetchMessageObject> = client.fetch(
        // { or: [{ new: true }, { seen: false }, { recent: true }] },
        '1:*',
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
          id: mail.uid,
          flags: mail.flags,
          labels: mail.labels,
        };
        mails.push(mailDto);
      }
    } catch (err) {
      throw new CustomHttpException(MailsErrorMessages.NotAbleToFetchMailsError, HttpStatus.INTERNAL_SERVER_ERROR, err);
    }

    mailboxLock?.release();
    await client.logout();
    client.close();

    Logger.log(`Feed: ${mails.length} new mails were fetched (imap)`, MailsService.name);
    return mails;
  };
}

export default MailsService;
