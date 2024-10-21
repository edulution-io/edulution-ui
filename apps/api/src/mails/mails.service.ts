import { Model } from 'mongoose';
import axios, { AxiosInstance } from 'axios';
import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { ArgumentMetadata, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import APPS from '@libs/appconfig/constants/apps';
import MAIL_IMAP_CACHE from '@libs/mail/constants/mail-chache';
import MailImapOptions from '@libs/mail/types/mail-imap-options';
import appExtensionIMAP from '@libs/appconfig/constants/appExtensionIMAP';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import MailsErrorMessages from '@libs/mail/constants/mails-error-messages';
import { MailDto, MailProviderConfigDto, CreateSyncJobDto, SyncJobResponseDto, SyncJobDto } from '@libs/mail/types';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { MailProvider, MailProviderDocument } from './mail-provider.schema';
import FilterUserPipe from '../common/pipes/filterUser.pipe';
import AppConfigService from '../appconfig/appconfig.service';

const { MAIL_API_URL, MAIL_API_KEY } = process.env;

@Injectable()
class MailsService {
  private mailcowApi: AxiosInstance;

  private imapClient: ImapFlow;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(MailProvider.name) private mailProviderModel: Model<MailProviderDocument>,
    private readonly appConfigService: AppConfigService,
  ) {
    this.mailcowApi = axios.create({
      baseURL: `${MAIL_API_URL}/api/v1`,
      headers: {
        [HTTP_HEADERS.XApiKey]: MAIL_API_KEY,
        [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
      },
    });
  }

  async getImapOptions(): Promise<MailImapOptions | undefined> {
    const chachedData = await this.cacheManager.get<MailImapOptions>(MAIL_IMAP_CACHE.CACHE_KEY);
    if (!chachedData) {
      const appConfig = await this.appConfigService.getAppConfigByName(APPS.MAIL);
      if (!appConfig) return undefined;
      const imapExtension = appConfig?.extendedOptions.find((option) => option.name === appExtensionIMAP.name);
      if (!imapExtension) return undefined;
      const imapExtendedOptions = imapExtension?.options.map((item) => ({
        [item.name]: item.value || item.defaultValue,
      }));
      const imapOptions = imapExtendedOptions?.reduce((acc, item) => ({ ...acc, ...item }), {});
      if (!imapOptions) {
        throw new CustomHttpException(CommonErrorMessages.EnvAccessError, HttpStatus.FAILED_DEPENDENCY);
      }
      void this.cacheManager.set(MAIL_IMAP_CACHE.CACHE_KEY, imapOptions, MAIL_IMAP_CACHE.CACHE_TTL);
      return imapOptions as MailImapOptions;
    }
    return chachedData;
  }

  async getMails(username: string, password: string): Promise<MailDto[]> {
    const imapOptions = await this.getImapOptions();
    if (!imapOptions) {
      throw new CustomHttpException(MailsErrorMessages.NotAbleToFetchMailsError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { MAIL_IMAP_URL, MAIL_IMAP_PORT, MAIL_IMAP_SECURE, MAIL_IMAP_TLS_REJECT_UNAUTHORIZED } = imapOptions;

    if (!MAIL_IMAP_URL || !MAIL_IMAP_PORT) {
      throw new CustomHttpException(CommonErrorMessages.EnvAccessError, HttpStatus.FAILED_DEPENDENCY);
    }

    this.imapClient = new ImapFlow({
      host: MAIL_IMAP_URL,
      port: MAIL_IMAP_PORT,
      secure: MAIL_IMAP_SECURE,
      tls: {
        rejectUnauthorized: MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
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
