/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ImapFlow } from 'imapflow';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import getErrorMessage from '@libs/common/utils/getErrorMessage';
import MAIL_IDLE_CONFIG from '@libs/mail/constants/mailIdleConfig';
import type MailNewMailNotificationDto from '@libs/mail/types/mailNewMailNotification.dto';
import type MailFlagsChangedNotificationDto from '@libs/mail/types/mailFlagsChangedNotification.dto';
import NOTIFICATION_SOURCE_TYPE from '@libs/notification/constants/notificationSourceType';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import NOTIFICATION_CREATOR_SYSTEM from '@libs/notification/constants/notificationCreatorSystem';
import NOTIFICATION_TEMPLATES from '@libs/notification/constants/notificationTemplates';
import AppConfigService from '../appconfig/appconfig.service';
import SseService from '../sse/sse.service';
import NotificationsService from '../notifications/notifications.service';

interface IdleConnection {
  client: ImapFlow;
  username: string;
  email: string;
  password: string;
  previousMailCount: number;
  idleRestartTimer?: NodeJS.Timeout;
  reconnectTimer?: NodeJS.Timeout;
  reconnectAttempts: number;
  isErrorHandled: boolean;
}

interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  rejectUnauthorized: boolean;
}

interface PendingReconnect {
  timer: NodeJS.Timeout;
}

interface PendingDisconnect {
  timer: NodeJS.Timeout;
}

@Injectable()
class MailIdleService implements OnModuleInit, OnModuleDestroy {
  private idleConnections = new Map<string, IdleConnection>();

  private pendingReconnects = new Map<string, PendingReconnect>();

  private pendingDisconnects = new Map<string, PendingDisconnect>();

  private imapConfig: ImapConfig = {
    host: '',
    port: 0,
    secure: false,
    rejectUnauthorized: false,
  };

  constructor(
    private readonly sseService: SseService,
    private readonly appConfigService: AppConfigService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private get connectionTimeout(): number {
    const value = this.configService.get<string>('EDUI_MAIL_IMAP_TIMEOUT');
    if (!value) return MAIL_IDLE_CONFIG.DEFAULT_CONNECTION_TIMEOUT;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? MAIL_IDLE_CONFIG.DEFAULT_CONNECTION_TIMEOUT : parsed;
  }

  private get maxConnections(): number {
    const value = this.configService.get<string>('EDUI_MAIL_IDLE_MAX_CONNECTIONS');
    if (!value) return MAIL_IDLE_CONFIG.DEFAULT_MAX_CONCURRENT_CONNECTIONS;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? MAIL_IDLE_CONFIG.DEFAULT_MAX_CONCURRENT_CONNECTIONS : parsed;
  }

  async onModuleInit() {
    await this.updateImapConfig();
  }

  async onModuleDestroy() {
    await this.stopAllConnections();
  }

  @OnEvent(`${EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED}-${APPS.MAIL}`)
  async updateImapConfig() {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.MAIL);

    if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
      return;
    }

    const rawHost = (appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_URL] as string) || '';
    const host = rawHost.replace(/^https?:\/\//, '');

    this.imapConfig = {
      host,
      port: (appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_PORT] as number) || 0,
      secure: !!appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_SECURE],
      rejectUnauthorized: !!appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED],
    };

    Logger.debug(
      `MailIdleService IMAP config updated: ${this.imapConfig.host}:${this.imapConfig.port}`,
      MailIdleService.name,
    );
  }

  async startIdle(username: string, email: string, password: string): Promise<void> {
    if (this.idleConnections.has(username)) {
      Logger.debug(`IDLE connection already exists for user: ${username}`, MailIdleService.name);
      return;
    }

    if (this.idleConnections.size >= this.maxConnections) {
      Logger.warn(
        `Max concurrent IDLE connections reached (${this.maxConnections}), skipping for: ${username}`,
        MailIdleService.name,
      );
      return;
    }

    if (!this.imapConfig.host || !this.imapConfig.port) {
      Logger.debug('IMAP configuration missing, skipping IDLE start', MailIdleService.name);
      return;
    }

    if (!email || !password) {
      Logger.debug('Email credentials missing, skipping IDLE start', MailIdleService.name);
      return;
    }

    try {
      await this.createIdleConnection(username, email, password);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Logger.error(`Failed to start IDLE for user ${username}: ${errorMessage}`, MailIdleService.name);
    }
  }

  private async createIdleConnection(username: string, email: string, password: string): Promise<void> {
    this.pendingReconnects.delete(username);

    const client = new ImapFlow({
      host: this.imapConfig.host,
      port: this.imapConfig.port,
      secure: this.imapConfig.secure,
      tls: {
        rejectUnauthorized: this.imapConfig.rejectUnauthorized,
      },
      auth: {
        user: email,
        pass: password,
      },
      logger: false,
      connectionTimeout: this.connectionTimeout,
    });

    const connection: IdleConnection = {
      client,
      username,
      email,
      password,
      previousMailCount: 0,
      reconnectAttempts: 0,
      isErrorHandled: false,
    };

    client.on('error', (err: Error) => {
      Logger.error(`IMAP IDLE error for ${username}: ${err.message}`, MailIdleService.name);
      if (!connection.isErrorHandled) {
        connection.isErrorHandled = true;
        void this.handleConnectionError(username);
      }
    });

    client.on('close', () => {
      Logger.debug(`IMAP connection closed for ${username}`, MailIdleService.name);
      if (!connection.isErrorHandled) {
        connection.isErrorHandled = true;
        void this.handleConnectionError(username);
      }
    });

    client.on('exists', (data: { path: string; count: number; prevCount: number }) => {
      this.handleExistsEvent(username, data.count, data.prevCount);
    });

    (client as NodeJS.EventEmitter).on(
      'flags',
      (data: { path: string; seq: number; uid: number; flags: Set<string> }) => {
        this.handleFlagsEvent(username, data.uid, data.flags);
      },
    );

    try {
      await client.connect();
      await client.mailboxOpen('INBOX');

      const mailboxStatus = client.mailbox;
      if (mailboxStatus) {
        connection.previousMailCount = mailboxStatus.exists || 0;
      }

      this.idleConnections.set(username, connection);
      this.scheduleIdleRestart(username);

      Logger.log(
        `IDLE started for user: ${username} (${connection.previousMailCount} mails, ${this.idleConnections.size}/${this.maxConnections} connections)`,
        MailIdleService.name,
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Logger.error(`Failed to connect IDLE for ${username}: ${errorMessage}`, MailIdleService.name);
      await MailIdleService.cleanupClient(client);
      throw error;
    }
  }

  private handleExistsEvent(username: string, count: number, prevCount: number): void {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    if (count > prevCount) {
      const newMailCount = count - prevCount;
      Logger.log(`New mail detected for ${username}: ${newMailCount} new mail(s)`, MailIdleService.name);

      const notification: MailNewMailNotificationDto = {
        count,
        previousCount: prevCount,
        newMailCount,
      };

      this.sseService.sendEventToUser(username, notification, SSE_MESSAGE_TYPE.MAIL_NEW_MAIL);
      void this.fetchNewMailsAndNotify(username, prevCount, count);
    }

    connection.previousMailCount = count;
  }

  private async fetchNewMailsAndNotify(username: string, prevCount: number, count: number): Promise<void> {
    const connection = this.idleConnections.get(username);
    if (!connection?.client?.usable) {
      return;
    }

    try {
      const newMailRange = `${prevCount + 1}:${count}`;
      const messages = await connection.client.fetchAll(newMailRange, { envelope: true, uid: true });

      await Promise.all(
        messages
          .filter((message) => message.envelope)
          .slice(0, MAIL_IDLE_CONFIG.MAX_FEED_MAILS)
          .map(async (message) => {
            const fromAddress = message.envelope?.from?.[0];
            const from = fromAddress?.name || fromAddress?.address || '';
            const subject = message.envelope?.subject || '';
            const sourceId = `${username}:${message.uid}`;

            const title = NOTIFICATION_TEMPLATES.MAIL.NEW.title(subject);
            const pushNotification = NOTIFICATION_TEMPLATES.MAIL.NEW.body(from);

            await this.notificationsService.upsertNotificationForSource(
              [username],
              {
                title,
                body: pushNotification,
                data: {
                  mailUid: message.uid,
                  type: SSE_MESSAGE_TYPE.MAIL_NEW_MAIL,
                },
              },
              NOTIFICATION_CREATOR_SYSTEM,
              {
                type: NOTIFICATION_TYPE.SYSTEM,
                sourceType: NOTIFICATION_SOURCE_TYPE.MAIL,
                sourceId,
                title,
                pushNotification,
                createdBy: NOTIFICATION_CREATOR_SYSTEM,
              },
              true,
            );
          }),
      );
    } catch (error) {
      Logger.error(
        `Failed to fetch new mail envelopes for notification: ${getErrorMessage(error)}`,
        MailIdleService.name,
      );
    }
  }

  private handleFlagsEvent(username: string, uid: number, flags: Set<string>): void {
    Logger.debug(`Flags changed for ${username}, mail ${uid}: ${Array.from(flags).join(', ')}`, MailIdleService.name);

    const notification: MailFlagsChangedNotificationDto = {
      uid,
      flags: Array.from(flags),
    };

    this.sseService.sendEventToUser(username, notification, SSE_MESSAGE_TYPE.MAIL_FLAGS_CHANGED);
  }

  private scheduleIdleRestart(username: string): void {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    if (connection.idleRestartTimer) {
      clearTimeout(connection.idleRestartTimer);
    }

    connection.idleRestartTimer = setTimeout(() => {
      void this.restartIdle(username);
    }, MAIL_IDLE_CONFIG.IDLE_TIMEOUT_MS);
  }

  private async restartIdle(username: string): Promise<void> {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    Logger.debug(`Restarting IDLE for ${username} (timeout prevention)`, MailIdleService.name);

    const { email, password } = connection;
    await this.stopIdle(username);

    try {
      await this.createIdleConnection(username, email, password);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Logger.error(`Failed to restart IDLE for ${username}: ${errorMessage}`, MailIdleService.name);
    }
  }

  private async handleConnectionError(username: string): Promise<void> {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    connection.reconnectAttempts += 1;

    if (connection.reconnectAttempts > MAIL_IDLE_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      Logger.warn(`Max reconnect attempts reached for ${username}, stopping IDLE`, MailIdleService.name);
      await this.stopIdle(username);
      return;
    }

    const delay = MAIL_IDLE_CONFIG.RECONNECT_DELAY_MS * connection.reconnectAttempts;
    Logger.debug(
      `Scheduling reconnect for ${username} in ${delay}ms (attempt ${connection.reconnectAttempts})`,
      MailIdleService.name,
    );

    const { email, password } = connection;
    await this.stopIdle(username);

    const reconnectTimer = setTimeout(() => {
      void this.createIdleConnection(username, email, password).catch((error) => {
        const errorMessage = getErrorMessage(error);
        Logger.error(`Reconnect failed for ${username}: ${errorMessage}`, MailIdleService.name);
      });
    }, delay);

    this.pendingReconnects.set(username, { timer: reconnectTimer });
  }

  async stopIdle(username: string): Promise<void> {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    if (connection.idleRestartTimer) {
      clearTimeout(connection.idleRestartTimer);
    }

    await MailIdleService.cleanupClient(connection.client);
    this.idleConnections.delete(username);

    Logger.log(`IDLE stopped for user: ${username}`, MailIdleService.name);
  }

  private cancelPendingReconnect(username: string): void {
    const pending = this.pendingReconnects.get(username);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingReconnects.delete(username);
      Logger.debug(`Cancelled pending reconnect for ${username}`, MailIdleService.name);
    }
  }

  @OnEvent(EVENT_EMITTER_EVENTS.SSE_USER_DISCONNECTED)
  handleUserDisconnected(username: string): void {
    if (!this.idleConnections.has(username)) {
      return;
    }

    if (this.pendingDisconnects.has(username)) {
      return;
    }

    Logger.debug(
      `User ${username} disconnected from SSE, starting grace period (${MAIL_IDLE_CONFIG.SSE_DISCONNECT_GRACE_PERIOD_MS}ms)`,
      MailIdleService.name,
    );

    const timer = setTimeout(() => {
      this.pendingDisconnects.delete(username);
      this.cancelPendingReconnect(username);

      if (this.idleConnections.has(username)) {
        Logger.debug(`Grace period expired for ${username}, stopping IDLE`, MailIdleService.name);
        void this.stopIdle(username);
      }
    }, MAIL_IDLE_CONFIG.SSE_DISCONNECT_GRACE_PERIOD_MS);

    this.pendingDisconnects.set(username, { timer });
  }

  @OnEvent(EVENT_EMITTER_EVENTS.SSE_USER_CONNECTED)
  handleUserConnected(username: string): void {
    const pending = this.pendingDisconnects.get(username);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingDisconnects.delete(username);
      Logger.debug(`User ${username} reconnected, cancelled pending IDLE disconnect`, MailIdleService.name);
    }
  }

  private async stopAllConnections(): Promise<void> {
    this.pendingDisconnects.forEach((pending) => clearTimeout(pending.timer));
    this.pendingDisconnects.clear();

    this.pendingReconnects.forEach((pending) => clearTimeout(pending.timer));
    this.pendingReconnects.clear();

    const usernames = Array.from(this.idleConnections.keys());
    await Promise.all(usernames.map((username) => this.stopIdle(username)));
    Logger.log(`All IDLE connections stopped (${usernames.length} connections)`, MailIdleService.name);
  }

  private static async cleanupClient(client: ImapFlow): Promise<void> {
    try {
      if (client?.usable) {
        await client.logout();
      }
    } catch (logoutError) {
      Logger.warn(
        `Failed to logout IMAP client: ${logoutError instanceof Error ? logoutError.message : String(logoutError)}`,
        MailIdleService.name,
      );
    } finally {
      try {
        client.close();
      } catch (closeError) {
        Logger.warn(
          `Failed to close IMAP client: ${closeError instanceof Error ? closeError.message : String(closeError)}`,
          MailIdleService.name,
        );
      }
    }
  }

  getConnectionStats(): { current: number; max: number } {
    return {
      current: this.idleConnections.size,
      max: this.maxConnections,
    };
  }
}

export default MailIdleService;
