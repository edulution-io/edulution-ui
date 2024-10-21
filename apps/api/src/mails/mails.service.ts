import { Model } from 'mongoose';
import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { ArgumentMetadata, HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import MailsErrorMessages from '@libs/mail/constants/mails-error-messages';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { MailDto, MailProviderConfigDto, CreateSyncJobDto, SyncJobResponseDto, SyncJobDto } from '@libs/mail/types';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { MailProvider, MailProviderDocument } from './mail-provider.schema';
import FilterUserPipe from '../common/pipes/filterUser.pipe';

const {
  MAIL_IMAP_URL,
  MAIL_API_URL,
  MAIL_IMAP_PORT,
  MAIL_IMAP_SECURE,
  MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
  MAIL_API_KEY,
} = process.env;

@Injectable()
class MailsService {
  private mailcowApi: AxiosInstance;

  private imapClient: ImapFlow;

  constructor(@InjectModel(MailProvider.name) private mailProviderModel: Model<MailProviderDocument>) {
    this.mailcowApi = axios.create({
      baseURL: `${MAIL_API_URL}/api/v1`,
      headers: {
        [HTTP_HEADERS.XApiKey]: MAIL_API_KEY,
        [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
      },
    });
  }

  async getMails(username: string, password: string): Promise<MailDto[]> {
    // TODO: NIEDUUI-348: Migrate this settings to AppConfigPage (set imap settings in mails app config)
    if (!MAIL_IMAP_URL || !MAIL_IMAP_PORT || !MAIL_IMAP_SECURE || !MAIL_IMAP_TLS_REJECT_UNAUTHORIZED) {
      return [];
    }
    if (Number.isNaN(Number(MAIL_IMAP_PORT))) {
      throw new CustomHttpException(MailsErrorMessages.NotValidPortTypeError, HttpStatus.BAD_REQUEST);
    }

    this.imapClient = new ImapFlow({
      host: MAIL_IMAP_URL,
      port: Number(MAIL_IMAP_PORT),
      secure: MAIL_IMAP_SECURE === 'true',
      tls: {
        rejectUnauthorized: MAIL_IMAP_TLS_REJECT_UNAUTHORIZED === 'true',
      },
      auth: {
        user: username,
        pass: password,
      },
      logger: false,
      connectionTimeout: 5000,
    });

    this.imapClient.on('error', (err: Error): void => {
      Logger.error(`IMAP-Error: ${err.message}`, MailsService.name);
      void this.imapClient.logout();
      this.imapClient.close();
    });

    await this.imapClient.connect().catch((err) => {
      throw new CustomHttpException(
        MailsErrorMessages.NotAbleToConnectClientError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        err,
      );
    });

    let mailboxLock: MailboxLockObject | undefined;
    const mails: MailDto[] = [];
    try {
      mailboxLock = await this.imapClient.getMailboxLock('INBOX');

      const fetchMail: AsyncGenerator<FetchMessageObject> = this.imapClient.fetch(
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
          id: mail.uid,
          flags: mail.flags,
          labels: mail.labels,
        };
        mails.push(mailDto);
      }
    } catch (err) {
      throw new CustomHttpException(MailsErrorMessages.NotAbleToFetchMailsError, HttpStatus.INTERNAL_SERVER_ERROR, err);
    } finally {
      if (mailboxLock) {
        mailboxLock.release();
      }
    }
    await this.imapClient.logout();
    this.imapClient.close();

    Logger.log(`Feed: ${mails.length} new mails were fetched (imap)`, MailsService.name);
    return mails;
  }

  static prepareMailProviderResponse(mailProvidersList: MailProviderDocument[]): MailProviderConfigDto[] {
    const mailProviders: MailProviderConfigDto[] = mailProvidersList.map((item) => ({
      id: item.mailProviderId,
      name: item.name,
      label: item.label,
      host: item.host,
      port: item.port,
      encryption: item.encryption,
    }));

    return mailProviders;
  }

  async getExternalMailProviderConfig(): Promise<MailProviderConfigDto[]> {
    const mailProvidersList = await this.mailProviderModel.find({}, 'mailProviderId name label host port encryption');

    if (!mailProvidersList) {
      throw new CustomHttpException(
        MailsErrorMessages.MailProviderNotFound,
        HttpStatus.NOT_FOUND,
        '',
        MailsService.name,
      );
    }

    return MailsService.prepareMailProviderResponse(mailProvidersList);
  }

  async postExternalMailProviderConfig(mailProviderConfig: MailProviderConfigDto): Promise<MailProviderConfigDto[]> {
    try {
      let response = {};
      if (mailProviderConfig.id !== '') {
        response =
          (await this.mailProviderModel.findOneAndUpdate(
            { mailProviderId: mailProviderConfig.id },
            { $set: mailProviderConfig },
            { upsert: true },
          )) || {};
      } else {
        response = await this.mailProviderModel.create(mailProviderConfig);
      }
      if (response) {
        const mailProvidersList = await this.mailProviderModel.find(
          {},
          'mailProviderId name label host port encryption',
        );
        return MailsService.prepareMailProviderResponse(mailProvidersList);
      }
    } catch (error) {
      throw new CustomHttpException(
        MailsErrorMessages.MailProviderNotFound,
        HttpStatus.NOT_FOUND,
        error,
        MailsService.name,
      );
    }
    throw new CustomHttpException(MailsErrorMessages.MailProviderNotFound, HttpStatus.NOT_FOUND, '', MailsService.name);
  }

  async deleteExternalMailProviderConfig(mailProviderId: string) {
    try {
      const deleteResponse = await this.mailProviderModel.deleteOne({ mailProviderId });
      if (deleteResponse.deletedCount === 1) {
        const mailProvidersList = await this.mailProviderModel.find(
          {},
          'mailProviderId name label host port encryption',
        );
        return MailsService.prepareMailProviderResponse(mailProvidersList);
      }
    } catch (error) {
      throw new CustomHttpException(
        MailsErrorMessages.MailProviderNotFound,
        HttpStatus.NOT_FOUND,
        error,
        MailsService.name,
      );
    }
    throw new CustomHttpException(MailsErrorMessages.MailProviderNotFound, HttpStatus.NOT_FOUND, '', MailsService.name);
  }

  async getSyncJobs(username: string) {
    try {
      const syncJobs = await this.mailcowApi.get<SyncJobDto[]>('/get/syncjobs/all/no_log');

      const filteredSyncJobs = new FilterUserPipe(username).transform(syncJobs.data, {} as ArgumentMetadata);

      return filteredSyncJobs;
    } catch (e) {
      throw new CustomHttpException(MailsErrorMessages.MailcowApiGetSyncJobsFailed, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async createSyncJob(createSyncJobDto: CreateSyncJobDto, username: string) {
    try {
      const response = await this.mailcowApi.post<SyncJobResponseDto>('/add/syncjob', createSyncJobDto);
      if (response) {
        const syncJobs = await this.getSyncJobs(username);
        return syncJobs;
      }
      throw new CustomHttpException(MailsErrorMessages.MailcowApiCreateSyncJobFailed, HttpStatus.BAD_GATEWAY);
    } catch (e) {
      throw new CustomHttpException(MailsErrorMessages.MailcowApiCreateSyncJobFailed, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async deleteSyncJobs(syncJobIds: string[], username: string) {
    // NIEDUUI-374: Check if user has permission to delete
    try {
      const response = await this.mailcowApi.post<SyncJobResponseDto>('/delete/syncjob', syncJobIds);
      if (response) {
        const syncJobs = await this.getSyncJobs(username);
        return syncJobs;
      }
      throw new CustomHttpException(MailsErrorMessages.MailcowApiDeleteSyncJobsFailed, HttpStatus.BAD_GATEWAY);
    } catch (e) {
      throw new CustomHttpException(MailsErrorMessages.MailcowApiDeleteSyncJobsFailed, HttpStatus.BAD_GATEWAY, e);
    }
  }
}

export default MailsService;
