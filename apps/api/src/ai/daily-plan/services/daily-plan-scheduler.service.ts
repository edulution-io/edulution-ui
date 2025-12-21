/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import DailyPlanService from '../daily-plan.service';
import NotificationsService from '../../../notifications/notifications.service';
import UsersService from '../../../users/users.service';
import RecommendationsService from '../../../recommendations/recommendations.service';

interface NotificationResult {
  sent: boolean;
  message: string;
}

interface TriggerAllResult {
  sent: number;
  skipped: number;
  failed: number;
}

type SupportedLanguage = 'de' | 'en' | 'fr';

const PUSH_TITLES: Record<SupportedLanguage, (count: number) => string> = {
  de: (count) => `${count} Aufgaben für heute`,
  en: (count) => `${count} tasks for today`,
  fr: (count) => `${count} tâches pour aujourd'hui`,
};

const PROD_MORNING_CRON = '0 8 * * *';
const DEV_CHECK_INTERVAL_MS = 30000;
const MIN_PUSH_INTERVAL_MS = 5 * 60 * 1000;

interface NotificationStatus {
  hash: string;
  notifiedAt: number;
}

@Injectable()
class DailyPlanSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(DailyPlanSchedulerService.name);

  private readonly isDev: boolean;

  private readonly notificationStatus = new Map<string, NotificationStatus>();

  constructor(
    private readonly dailyPlanService: DailyPlanService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly recommendationsService: RecommendationsService,
  ) {
    this.isDev = this.configService.get('NODE_ENV') !== 'production';
  }

  onModuleInit() {
    this.logger.log(`Daily plan scheduler initialized (mode: ${this.isDev ? 'DEV' : 'PROD'})`);
  }

  @Cron(PROD_MORNING_CRON, {
    name: 'daily-plan-morning',
    timeZone: 'Europe/Berlin',
  })
  async handleMorningGeneration(): Promise<void> {
    if (this.isDev) {
      return;
    }

    this.logger.log('🌅 PROD: Running morning daily plan generation...');
    await this.generateAndPushForAllUsers();
  }

  @Interval(DEV_CHECK_INTERVAL_MS)
  async handleDevCheck(): Promise<void> {
    if (!this.isDev) {
      return;
    }

    this.logger.debug('DEV: Checking for new recommendations...');
    await this.checkForChangesAndNotify();
  }

  private async sendPushToAllUsers(): Promise<TriggerAllResult> {
    const startTime = Date.now();
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    try {
      const users = await this.usersService.findUsersWithPushTokens();
      this.logger.log(`Found ${users.length} users with push tokens`);

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const user of users) {
        try {
          const sent = await this.sendDailyPlanPush(user.username, user.language);
          if (sent) {
            successCount++;
          } else {
            skipCount++;
          }
        } catch (error) {
          this.logger.error(`Failed for ${user.username}: ${(error as Error).message}`);
          failCount++;
        }
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop */

      const duration = Date.now() - startTime;
      this.logger.log(
        `Morning push complete: ${successCount} sent, ${skipCount} skipped, ${failCount} failed (${duration}ms)`,
      );
    } catch (error) {
      this.logger.error(`Morning push failed: ${(error as Error).message}`);
    }

    return { sent: successCount, skipped: skipCount, failed: failCount };
  }

  private async generateAndPushForAllUsers(): Promise<TriggerAllResult> {
    const startTime = Date.now();
    const today = new Date().toISOString().split('T')[0];
    let generated = 0;
    let pushed = 0;
    let skipped = 0;
    let failed = 0;

    try {
      const users = await this.usersService.findUsersWithPushTokens();
      this.logger.log(`PROD: Generating plans for ${users.length} users`);

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const user of users) {
        try {
          await this.dailyPlanService.invalidateCache(user.username, today);

          const result = await this.dailyPlanService.getOrGenerateDailyPlan(user.username, today, {
            refresh: true,
          });

          generated++;

          if (result.plan?.priorities?.length > 0) {
            const sent = await this.sendDailyPlanPush(user.username, user.language);
            if (sent) {
              pushed++;
            } else {
              skipped++;
            }
          } else {
            skipped++;
          }
        } catch (error) {
          this.logger.error(`PROD: Failed for ${user.username}: ${(error as Error).message}`);
          failed++;
        }
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop */

      const duration = Date.now() - startTime;
      this.logger.log(
        `🌅 PROD Morning generation complete: ${generated} generated, ${pushed} pushed, ${skipped} skipped, ${failed} failed (${duration}ms)`,
      );
    } catch (error) {
      this.logger.error(`PROD Morning generation failed: ${(error as Error).message}`);
    }

    return { sent: pushed, skipped, failed };
  }

  private async checkForChangesAndNotify(): Promise<void> {
    try {
      const users = await this.usersService.findUsersWithPushTokens();

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const user of users) {
        await this.checkUserAndNotify(user.username, user.language);
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop */
    } catch (error) {
      this.logger.error(`DEV check failed: ${(error as Error).message}`);
    }
  }

  private async checkUserAndNotify(username: string, language: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const result = await this.dailyPlanService.getOrGenerateDailyPlan(username, today, {
      refresh: false,
    });

    const currentHash = result.inputHash;
    const status = this.notificationStatus.get(username);
    const now = Date.now();

    // Skip if hash unchanged
    if (status?.hash === currentHash) {
      return;
    }

    // Debounce: skip if notified too recently (even with different hash)
    if (status && now - status.notifiedAt < MIN_PUSH_INTERVAL_MS) {
      this.logger.debug(`Debounce: skipping push for ${username}, last push ${Math.round((now - status.notifiedAt) / 1000)}s ago`);
      return;
    }

    this.logger.log(`New content for ${username}, sending push`);
    const sent = await this.sendDailyPlanPush(username, language);

    if (sent) {
      this.notificationStatus.set(username, { hash: currentHash, notifiedAt: now });
    }
  }

  private async sendDailyPlanPush(username: string, language: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];

    const recommendations = await this.recommendationsService.list(username, 10);

    if (!recommendations?.length) {
      this.logger.debug(`No recommendations for ${username}, skipping`);
      return false;
    }

    const topReco = recommendations[0];
    const count = recommendations.length;

    const title = topReco.push_title || DailyPlanSchedulerService.getFallbackTitle(language, count);
    const body = topReco.push_content || topReco.rationale || topReco.title;

    await this.notificationsService.notifyUsernames([username], {
      title,
      body,
      data: {
        type: 'recommendation',
        date: today,
        candidateId: topReco.candidate_id,
        count,
        action: 'open_recommendations',
      },
    });

    this.logger.debug(`Push sent to ${username}: "${title}"`);
    return true;
  }

  private static getFallbackTitle(language: string, count: number): string {
    const lang = DailyPlanSchedulerService.normalizeLanguage(language);
    return PUSH_TITLES[lang](count);
  }

  private static normalizeLanguage(lang?: string): SupportedLanguage {
    if (!lang) return 'de';
    const normalized = lang.toLowerCase().slice(0, 2);
    if (normalized === 'en') return 'en';
    if (normalized === 'fr') return 'fr';
    return 'de';
  }

  async triggerNotificationForUser(username: string): Promise<NotificationResult> {
    try {
      const user = await this.usersService.findOne(username);
      if (!user) {
        return { sent: false, message: 'User not found' };
      }

      const sent = await this.sendDailyPlanPush(username, user.language || 'de');
      return { sent, message: sent ? 'Push sent' : 'No priorities, skipped' };
    } catch (error) {
      return { sent: false, message: (error as Error).message };
    }
  }

  async triggerForAllUsers(): Promise<TriggerAllResult> {
    if (this.isDev) {
      return this.sendPushToAllUsers();
    }
    return this.generateAndPushForAllUsers();
  }

  clearCache(username?: string): void {
    if (username) {
      this.notificationStatus.delete(username);
    } else {
      this.notificationStatus.clear();
    }
    this.logger.debug(`Cache cleared for ${username || 'all users'}`);
  }
}

export default DailyPlanSchedulerService;
export type { NotificationResult, TriggerAllResult };
