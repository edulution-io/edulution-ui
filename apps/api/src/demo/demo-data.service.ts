/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import {
  buildUserCounts24hKey,
  buildUserLastSeenKey,
  buildCommunicationsOpenKey,
  buildCommunicationsAwaitingKey,
  buildCalendarUpcomingKey,
  TTL_CONFIG,
} from '@edulution/events';
import type { EventInput, EventSource } from '@edulution/events';
import redisConnection from '../common/redis.connection';
import EventsService from '../events/events.service';
import RecommendationsService from '../recommendations/recommendations.service';
import { CrossAppEvaluatorService, type CrossAppEvent } from '../recommendations/rules/cross-app';
import DailyPlanService from '../ai/daily-plan/daily-plan.service';
import DEMO_USER_SETS from './demo-user-sets';
import type { DemoScenario } from './demo-user-sets';
import {
  createConferenceEvent,
  createSurveyEvent,
  createProjectEvent,
  createClassEvent,
  createExamSessionEvent,
  createMailWithAttachmentsEvent,
  createImportantBulletinEvent,
  createMailWithAttachmentsFileEvent,
  createFileUploadedEvent,
  createFileSharedEvent,
  createFileModifiedEvent,
  createFileDownloadRequestedEvent,
} from './factories';

interface GenerateDemoOptions {
  userId: string;
  scenario: DemoScenario;
  date?: Date;
  eventCount?: number;
  persist?: boolean;
}

interface GenerateDemoResult {
  userId: string;
  scenario: DemoScenario;
  eventsCreated: number;
  date: string;
}

interface BatchGenerateResult {
  userSet: string;
  date: string;
  results: Array<{ userId: string; scenario: string; eventsCreated: number }>;
  totalEvents: number;
}

interface AllUsersGenerateResult {
  scenario: string;
  date: string;
  results: Array<{ userId: string; eventsCreated: number }>;
  totalEvents: number;
}

@Injectable()
class DemoDataService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DemoDataService.name);

  private readonly isDev: boolean;

  private redis: Redis | null = null;

  constructor(
    private readonly eventsService: EventsService,
    @Inject(forwardRef(() => RecommendationsService))
    private readonly recommendationsService: RecommendationsService,
    @Inject(forwardRef(() => CrossAppEvaluatorService))
    private readonly crossAppEvaluator: CrossAppEvaluatorService,
    @Inject(forwardRef(() => DailyPlanService))
    private readonly dailyPlanService: DailyPlanService,
    private readonly configService: ConfigService,
  ) {
    this.isDev = this.configService.get('NODE_ENV') !== 'production';
  }

  async onModuleInit(): Promise<void> {
    this.redis = new Redis({
      host: redisConnection.host,
      port: redisConnection.port,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    await this.redis.connect();
    this.logger.log(`DemoDataService initialized (mode: ${this.isDev ? 'DEV' : 'PROD'})`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  private ensureRedis(): Redis {
    if (!this.redis) {
      throw new Error('Redis not connected');
    }
    return this.redis;
  }

  async generateDemoData(options: GenerateDemoOptions): Promise<GenerateDemoResult> {
    const { userId, scenario, date = new Date(), persist = true } = options;

    const events = this.generateEventsForScenario(userId, scenario, date, options.eventCount);

    if (persist) {
      await this.recommendationsService.clear(userId);
      this.logger.log(`Cleared old recommendations for ${userId}`);

      const result = await this.eventsService.ingestMany(events);
      this.logger.log(
        `Generated ${result.successful} events for ${userId} (${scenario}), ${result.failed} failed`,
      );

      await this.updateStateKeys(userId, events);
      this.logger.log(`Updated state keys for ${userId} with ${events.length} events`);

      const crossAppCandidates = await this.evaluateCrossAppRules(userId, events);
      if (crossAppCandidates > 0) {
        this.logger.log(`Generated ${crossAppCandidates} cross-app recommendations for ${userId}`);
      }

      const today = date.toISOString().split('T')[0];
      if (this.isDev) {
        await this.dailyPlanService.invalidateCache(userId, today);
        this.logger.log(`DEV: Invalidated daily plan cache for ${userId}/${today}`);
      } else {
        this.logger.log(`PROD: Stored data for ${userId}, will be processed at next scheduled morning run`);
      }
    }

    return {
      userId,
      scenario,
      eventsCreated: events.length,
      date: date.toISOString().split('T')[0],
    };
  }

  private async evaluateCrossAppRules(userId: string, events: EventInput[]): Promise<number> {
    const crossAppEvents: CrossAppEvent[] = events
      .filter((e) => this.isCrossAppEventType(e.type))
      .map((e) => ({
        event_id: randomUUID(),
        user_id: userId,
        type: e.type,
        source: e.source,
        occurred_at: e.occurred_at || new Date().toISOString(),
        object: {
          object_type: e.object.object_type,
          object_id: e.object.object_id,
          object_ref: e.object.object_ref ?? undefined,
        },
        metadata: e.metadata as Record<string, unknown>,
        payload: e.payload as Record<string, unknown>,
      }));

    if (crossAppEvents.length === 0) {
      return 0;
    }

    const candidates = await this.crossAppEvaluator.evaluateEvents(crossAppEvents);

    for (const candidate of candidates) {
      await this.recommendationsService.putCandidate(candidate, candidate.scores?.confidence || 0.8);
    }

    return candidates.length;
  }

  private isCrossAppEventType(type: string): boolean {
    const crossAppTypes = [
      'conference.created',
      'survey.created',
      'project.created',
      'class.created',
      'session.started',
      'mail.received',
      'bulletin.created',
    ];
    return crossAppTypes.includes(type);
  }

  private async updateStateKeys(userId: string, events: EventInput[]): Promise<void> {
    const redis = this.ensureRedis();

    const counts24hKey = buildUserCounts24hKey(userId);
    const lastSeenKey = buildUserLastSeenKey(userId);
    const openThreadsKey = buildCommunicationsOpenKey(userId);
    const awaitingKey = buildCommunicationsAwaitingKey(userId);
    const calendarKey = buildCalendarUpcomingKey(userId);

    const pipeline = redis.pipeline();

    const typeCounts: Record<string, number> = {};
    const sourceLastSeen: Record<string, string> = {};
    const threadIds = new Set<string>();
    const awaitingThreads = new Set<string>();
    const meetings: Array<{ id: string; scheduledAt: number }> = [];

    for (const event of events) {
      typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;

      if (event.occurred_at) {
        const {source} = event;
        if (!sourceLastSeen[source] || event.occurred_at > sourceLastSeen[source]) {
          sourceLastSeen[source] = event.occurred_at;
        }
      }

      if (event.context?.thread_id) {
        threadIds.add(event.context.thread_id);
        if (event.type === 'mail.received') {
          awaitingThreads.add(event.context.thread_id);
        } else if (event.type === 'mail.sent') {
          awaitingThreads.delete(event.context.thread_id);
        }
      }

      if (event.type === 'calendar.event_created' && event.metadata?.scheduled_at) {
        const scheduledAtValue = event.metadata.scheduled_at;
        const scheduledAt =
          typeof scheduledAtValue === 'string' ? new Date(scheduledAtValue).getTime() : Number(scheduledAtValue);
        meetings.push({
          id: event.object.object_id,
          scheduledAt,
        });
      }
    }

    const TTL_24H = 86400;

    for (const [type, count] of Object.entries(typeCounts)) {
      pipeline.hincrby(counts24hKey, type, count);
    }
    pipeline.expire(counts24hKey, TTL_CONFIG.COUNTS_24H_TTL_SECONDS);

    for (const [source, timestamp] of Object.entries(sourceLastSeen)) {
      pipeline.hset(lastSeenKey, source, timestamp);
    }
    pipeline.expire(lastSeenKey, TTL_24H);

    for (const threadId of threadIds) {
      pipeline.zadd(openThreadsKey, Date.now(), threadId);
    }
    if (threadIds.size > 0) {
      pipeline.expire(openThreadsKey, TTL_24H);
    }

    for (const threadId of awaitingThreads) {
      pipeline.sadd(awaitingKey, threadId);
    }
    if (awaitingThreads.size > 0) {
      pipeline.expire(awaitingKey, TTL_24H);
    }

    for (const meeting of meetings) {
      pipeline.zadd(calendarKey, meeting.scheduledAt, meeting.id);
    }
    if (meetings.length > 0) {
      pipeline.expire(calendarKey, TTL_24H);
    }

    await pipeline.exec();
  }

  async generateForUserSet(userSet: string, date: Date = new Date()): Promise<BatchGenerateResult> {
    const configs = DEMO_USER_SETS[userSet];
    if (!configs) {
      throw new Error(`Unknown user set: ${userSet}. Available: ${Object.keys(DEMO_USER_SETS).join(', ')}`);
    }

    const results: Array<{ userId: string; scenario: string; eventsCreated: number }> = [];
    let totalEvents = 0;

    this.logger.log(`Generating demo data for user set: ${userSet} (${configs.length} users)`);

    for (const config of configs) {
      const result = await this.generateDemoData({
        userId: config.userId,
        scenario: config.scenario,
        eventCount: config.eventCount,
        date,
      });

      results.push({
        userId: result.userId,
        scenario: result.scenario,
        eventsCreated: result.eventsCreated,
      });

      totalEvents += result.eventsCreated;
      this.logger.log(`  ✓ ${config.userId}: ${result.eventsCreated} events (${config.scenario})`);
    }

    return {
      userSet,
      date: date.toISOString().split('T')[0],
      results,
      totalEvents,
    };
  }

  async generateForAllUsers(
    users: string[],
    scenario: DemoScenario,
    date: Date = new Date(),
    eventCount?: number,
  ): Promise<AllUsersGenerateResult> {
    const results: Array<{ userId: string; eventsCreated: number }> = [];
    let totalEvents = 0;

    for (const userId of users) {
      const result = await this.generateDemoData({
        userId,
        scenario,
        eventCount,
        date,
      });

      results.push({
        userId: result.userId,
        eventsCreated: result.eventsCreated,
      });

      totalEvents += result.eventsCreated;
    }

    return {
      scenario,
      date: date.toISOString().split('T')[0],
      results,
      totalEvents,
    };
  }

  getAvailableUserSets(): Array<{ name: string; users: Array<{ userId: string; scenario: string }> }> {
    return Object.entries(DEMO_USER_SETS).map(([name, configs]) => ({
      name,
      users: configs.map((c) => ({ userId: c.userId, scenario: c.scenario })),
    }));
  }

  private generateEventsForScenario(
    userId: string,
    scenario: DemoScenario,
    baseDate: Date,
    overrideCount?: number,
  ): EventInput[] {
    switch (scenario) {
      case 'busy_day':
        return this.generateBusyDay(userId, baseDate, overrideCount);
      case 'light_day':
        return this.generateLightDay(userId, baseDate, overrideCount);
      case 'communication':
        return this.generateCommunicationDay(userId, baseDate, overrideCount);
      case 'focus_day':
        return this.generateFocusDay(userId, baseDate, overrideCount);
      case 'teacher_day':
        return this.generateTeacherDay(userId, baseDate, overrideCount);
      case 'cross_app_full':
        return this.generateCrossAppFull(userId, baseDate);
      case 'cross_app_teacher':
        return this.generateCrossAppTeacher(userId, baseDate);
      case 'cross_app_admin':
        return this.generateCrossAppAdmin(userId, baseDate);
      case 'conference_heavy':
        return this.generateConferenceHeavy(userId, baseDate);
      case 'exam_day':
        return this.generateExamDay(userId, baseDate);
      case 'files_heavy':
        return this.generateFilesHeavy(userId, baseDate);
      case 'mixed':
      default:
        return this.generateMixedDay(userId, baseDate, overrideCount);
    }
  }

  private generateBusyDay(userId: string, baseDate: Date, count?: number): EventInput[] {
    const events: EventInput[] = [];
    const targetCount = count || 50;

    const meetingTimes = [9, 10.5, 13, 14.5, 16];
    for (const hour of meetingTimes) {
      events.push(this.createCalendarEvent(userId, baseDate, hour, 'Team Sync'));
    }

    for (let i = 0; i < 25; i++) {
      const hour = 8 + Math.random() * 10;
      const isReceived = Math.random() > 0.3;
      if (isReceived) {
        events.push(this.createMailReceived(userId, baseDate, hour, `thread-${i % 8}`));
      } else {
        events.push(this.createMailSent(userId, baseDate, hour, `thread-${i % 8}`));
      }
    }

    for (let i = 0; i < 10; i++) {
      events.push(this.createChatMessage(userId, baseDate, 9 + Math.random() * 8, i % 2 === 0));
    }

    for (let i = 0; i < 5; i++) {
      events.push(this.createFileEvent(userId, baseDate, 10 + Math.random() * 6));
    }

    return events.slice(0, targetCount);
  }

  private generateLightDay(userId: string, baseDate: Date, count?: number): EventInput[] {
    const events: EventInput[] = [];
    const targetCount = count || 8;

    events.push(this.createCalendarEvent(userId, baseDate, 10, 'Weekly Check-in'));

    for (let i = 0; i < 4; i++) {
      events.push(this.createMailReceived(userId, baseDate, 9 + i * 2, `thread-light-${i}`));
    }

    events.push(this.createFileEvent(userId, baseDate, 14));

    return events.slice(0, targetCount);
  }

  private generateCommunicationDay(userId: string, baseDate: Date, count?: number): EventInput[] {
    const events: EventInput[] = [];
    const targetCount = count || 40;

    for (let i = 0; i < 20; i++) {
      const threadId = `thread-comm-${i % 5}`;
      events.push(this.createMailReceived(userId, baseDate, 8 + i * 0.5, threadId));

      if (i % 3 === 0) {
        events.push(this.createMailSent(userId, baseDate, 8.5 + i * 0.5, threadId));
      }
    }

    for (let i = 0; i < 15; i++) {
      events.push(this.createChatMessage(userId, baseDate, 9 + i * 0.5, i % 3 !== 0));
    }

    events.push(this.createCalendarEvent(userId, baseDate, 11, 'Quick Sync'));

    return events.slice(0, targetCount);
  }

  private generateFocusDay(userId: string, baseDate: Date, count?: number): EventInput[] {
    const events: EventInput[] = [];
    const targetCount = count || 15;

    events.push(this.createCalendarEvent(userId, baseDate, 9, 'Morning Standup'));

    for (let i = 0; i < 5; i++) {
      const threadId = `thread-focus-${i}`;
      events.push(this.createMailReceived(userId, baseDate, 8 + i, threadId));
      events.push(this.createMailSent(userId, baseDate, 8.5 + i, threadId));
    }

    for (let i = 0; i < 4; i++) {
      events.push(this.createFileEvent(userId, baseDate, 10 + i * 1.5));
    }

    return events.slice(0, targetCount);
  }

  private generateTeacherDay(userId: string, baseDate: Date, count?: number): EventInput[] {
    const events: EventInput[] = [];
    const targetCount = count || 35;

    events.push(this.createBulletinEvent(userId, baseDate, 8, 'created'));
    events.push(this.createBulletinEvent(userId, baseDate, 8.5, 'updated'));

    events.push(this.createSurveyEvent(userId, baseDate, 9, 'created'));
    for (let i = 0; i < 5; i++) {
      events.push(this.createSurveyEvent(userId, baseDate, 10 + i * 0.5, 'answer_submitted'));
    }

    events.push(this.createConferenceEvent(userId, baseDate, 11, 'created'));
    events.push(this.createConferenceEvent(userId, baseDate, 11, 'started'));
    events.push(this.createConferenceEvent(userId, baseDate, 12, 'ended'));

    events.push(this.createWhiteboardEvent(userId, baseDate, 14, 'started'));
    events.push(this.createWhiteboardEvent(userId, baseDate, 15, 'ended'));

    for (let i = 0; i < 5; i++) {
      events.push(this.createFileEvent(userId, baseDate, 15 + i * 0.3));
    }

    for (let i = 0; i < 8; i++) {
      events.push(this.createMailReceived(userId, baseDate, 8 + i, `parent-thread-${i}`));
    }

    return events.slice(0, targetCount);
  }

  private generateMixedDay(userId: string, baseDate: Date, count?: number): EventInput[] {
    const events: EventInput[] = [];
    const targetCount = count || 25;

    events.push(this.createCalendarEvent(userId, baseDate, 10, 'Team Meeting'));
    events.push(this.createCalendarEvent(userId, baseDate, 14, 'Review'));

    for (let i = 0; i < 10; i++) {
      events.push(this.createMailReceived(userId, baseDate, 8 + i, `thread-${i % 4}`));
    }

    for (let i = 0; i < 5; i++) {
      events.push(this.createChatMessage(userId, baseDate, 9 + i * 2, true));
    }

    for (let i = 0; i < 3; i++) {
      events.push(this.createFileEvent(userId, baseDate, 11 + i * 2));
    }

    return events.slice(0, targetCount);
  }

  private generateCrossAppFull(userId: string, baseDate: Date): EventInput[] {
    return [
      createConferenceEvent({
        userId,
        baseDate,
        hour: 10,
        subjectName: 'Mathematik',
        participants: ['student-1', 'student-2'],
      }),
      createSurveyEvent({
        userId,
        baseDate,
        title: 'Feedback zur Unterrichtsqualität',
        targetGroups: ['teachers', 'students'],
      }),
      createProjectEvent({
        userId,
        baseDate,
        projectName: 'Jahrbuch 2025',
        members: ['user-1', 'user-2', 'user-3'],
      }),
      createClassEvent({
        userId,
        baseDate,
        className: '8a',
        students: ['student-1', 'student-2', 'student-3'],
        teachers: [userId],
      }),
      createExamSessionEvent({
        userId,
        baseDate,
        hour: 8,
        className: '10b',
        students: ['student-a', 'student-b'],
      }),
      createMailWithAttachmentsEvent({
        userId,
        baseDate,
        subject: 'Unterrichtsmaterialien',
        attachments: [
          { filename: 'Arbeitsblatt.pdf', size: 245000 },
          { filename: 'Lösungen.docx', size: 128000 },
        ],
      }),
      createImportantBulletinEvent({
        userId,
        baseDate,
        title: 'Schulausfall am Montag',
        targetGroups: [
          { group_id: 'all-teachers', name: 'Alle Lehrer', chat_id: 'chat-teachers' },
          { group_id: 'all-students', name: 'Alle Schüler', chat_id: 'chat-students' },
        ],
      }),
    ];
  }

  private generateCrossAppTeacher(userId: string, baseDate: Date): EventInput[] {
    return [
      createConferenceEvent({
        userId,
        baseDate,
        hour: 8,
        subjectName: 'Deutsch',
      }),
      createConferenceEvent({
        userId,
        baseDate,
        hour: 10,
        subjectName: 'Mathematik',
      }),
      createClassEvent({
        userId,
        baseDate,
        className: '9a',
        students: ['s1', 's2', 's3'],
      }),
      createExamSessionEvent({
        userId,
        baseDate,
        hour: 12,
        className: '10a',
        students: ['s4', 's5'],
      }),
    ];
  }

  private generateCrossAppAdmin(userId: string, baseDate: Date): EventInput[] {
    return [
      createSurveyEvent({
        userId,
        baseDate,
        title: 'Schulzufriedenheit 2025',
      }),
      createSurveyEvent({
        userId,
        baseDate,
        title: 'Mensa-Feedback',
      }),
      createImportantBulletinEvent({
        userId,
        baseDate,
        title: 'Neue Schulordnung',
        targetGroups: [{ group_id: 'all', name: 'Alle', chat_id: 'chat-all' }],
      }),
      createProjectEvent({
        userId,
        baseDate,
        projectName: 'Schulfest 2025',
        members: ['org-1', 'org-2'],
      }),
    ];
  }

  private generateConferenceHeavy(userId: string, baseDate: Date): EventInput[] {
    const subjects = ['Mathematik', 'Deutsch', 'Englisch', 'Physik', 'Chemie'];
    return subjects.map((subjectName, i) =>
      createConferenceEvent({
        userId,
        baseDate,
        hour: 8 + i * 2,
        subjectName,
      }),
    );
  }

  private generateExamDay(userId: string, baseDate: Date): EventInput[] {
    const classes = ['8a', '8b', '9a', '10b'];
    return classes.map((className, i) =>
      createExamSessionEvent({
        userId,
        baseDate,
        hour: 8 + i * 2,
        className,
        students: [`${className}-s1`, `${className}-s2`, `${className}-s3`],
      }),
    );
  }

  private generateFilesHeavy(userId: string, baseDate: Date): EventInput[] {
    return [
      createMailWithAttachmentsFileEvent({
        userId,
        baseDate,
        hour: 8,
        subject: 'Unterrichtsmaterial Mathematik',
        from: 'fachschaft-mathe@schule.de',
        attachments: [
          { filename: 'Arbeitsblatt_Algebra.pdf', size: 245000 },
          { filename: 'Lösungen.docx', size: 89000 },
        ],
      }),
      createMailWithAttachmentsFileEvent({
        userId,
        baseDate,
        hour: 8.5,
        subject: 'Klassenfotos 10b',
        from: 'fotograf@schule.de',
        attachments: [
          { filename: 'Klassenfoto_2025.jpg', size: 3500000 },
          { filename: 'Einzelfotos.zip', size: 45000000 },
        ],
      }),
      createMailWithAttachmentsFileEvent({
        userId,
        baseDate,
        hour: 9,
        subject: 'Elternbrief Dezember',
        from: 'sekretariat@schule.de',
        attachments: [
          { filename: 'Elternbrief_Dez2025.pdf', size: 125000 },
        ],
      }),
      createFileUploadedEvent({
        userId,
        baseDate,
        hour: 9.5,
        filename: 'Notenliste_10b_unfertig.xlsx',
        path: '/Downloads',
        size: 45000,
      }),
      createFileUploadedEvent({
        userId,
        baseDate,
        hour: 10,
        filename: 'Präsentation_Elternabend.pptx',
        path: '/Downloads',
        size: 2500000,
      }),
      createFileModifiedEvent({
        userId,
        baseDate,
        hour: 11,
        filename: 'Jahresplanung_2025.docx',
        path: '/Dokumente/Planung',
        modificationCount: 25,
        lastBackup: null,
      }),
      createFileSharedEvent({
        userId,
        baseDate,
        hour: 12,
        filename: 'Projektplan_AG.pdf',
        path: '/Projekte',
        sharedWith: ['kollege1@schule.de', 'kollege2@schule.de'],
        shareType: 'read',
      }),
      createFileDownloadRequestedEvent({
        userId,
        baseDate,
        hour: 13,
        filename: 'Hausaufgaben_Woche50.pdf',
        path: '/Aufgaben',
        requestedBy: 'schueler.max@schule.de',
      }),
    ];
  }

  private createMailReceived(
    userId: string,
    baseDate: Date,
    hour: number,
    threadId: string,
  ): EventInput {
    return {
      source: 'mail' as EventSource,
      type: 'mail.received',
      user_id: userId,
      object: { object_type: 'message', object_id: randomUUID() },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      context: { thread_id: threadId },
      metadata: { subject_length: 30, has_attachments: Math.random() > 0.7 },
      sensitivity: 'medium',
      correlation_id: randomUUID(),
    };
  }

  private createMailSent(
    userId: string,
    baseDate: Date,
    hour: number,
    threadId: string,
  ): EventInput {
    return {
      source: 'mail' as EventSource,
      type: 'mail.sent',
      user_id: userId,
      object: { object_type: 'message', object_id: randomUUID() },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      context: { thread_id: threadId },
      metadata: { subject_length: 25, has_attachments: false },
      sensitivity: 'medium',
      correlation_id: randomUUID(),
    };
  }

  private createCalendarEvent(
    userId: string,
    baseDate: Date,
    hour: number,
    title: string,
  ): EventInput {
    return {
      source: 'caldav' as EventSource,
      type: 'calendar.event_created',
      user_id: userId,
      object: { object_type: 'calendar_event', object_id: randomUUID() },
      occurred_at: this.setHour(baseDate, hour - 1).toISOString(),
      metadata: {
        title,
        scheduled_at: this.setHour(baseDate, hour).toISOString(),
        duration_minutes: 60,
      },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    };
  }

  private createChatMessage(
    userId: string,
    baseDate: Date,
    hour: number,
    received: boolean,
  ): EventInput {
    return {
      source: 'chat' as EventSource,
      type: received ? 'chat.message_received' : 'chat.message_sent',
      user_id: userId,
      object: { object_type: 'message', object_id: randomUUID() },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      context: { context_id: 'general' },
      metadata: { message_length: 50 + Math.floor(Math.random() * 100) },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    };
  }

  private createFileEvent(userId: string, baseDate: Date, hour: number): EventInput {
    const types = ['file.created', 'file.uploaded', 'file.shared'];
    return {
      source: 'files' as EventSource,
      type: types[Math.floor(Math.random() * types.length)],
      user_id: userId,
      object: { object_type: 'file', object_id: randomUUID() },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      metadata: { path: `/documents/file-${Date.now()}.pdf`, size: 1024 * 100 },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    };
  }

  private createBulletinEvent(
    userId: string,
    baseDate: Date,
    hour: number,
    action: string,
  ): EventInput {
    return {
      source: 'bulletin' as EventSource,
      type: `bulletin.${action}`,
      user_id: userId,
      object: { object_type: 'bulletin', object_id: randomUUID() },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      metadata: { title: 'Weekly Update', category: 'announcements' },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    };
  }

  private createSurveyEvent(
    userId: string,
    baseDate: Date,
    hour: number,
    action: string,
  ): EventInput {
    return {
      source: 'surveys' as EventSource,
      type: action === 'created' ? 'survey.created' : 'survey.answer_submitted',
      user_id: userId,
      object: { object_type: 'survey', object_id: 'survey-quiz-1' },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      metadata: { title: 'Chapter Quiz', question_count: 10 },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    };
  }

  private createConferenceEvent(
    userId: string,
    baseDate: Date,
    hour: number,
    action: string,
  ): EventInput {
    return {
      source: 'conferences' as EventSource,
      type: `conference.${action}`,
      user_id: userId,
      object: { object_type: 'conference', object_id: 'conf-1' },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      metadata: { title: 'Parent Meeting', participant_count: 3 },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    };
  }

  private createWhiteboardEvent(
    userId: string,
    baseDate: Date,
    hour: number,
    action: string,
  ): EventInput {
    return {
      source: 'whiteboard' as EventSource,
      type: `whiteboard.session_${action}`,
      user_id: userId,
      object: { object_type: 'whiteboard', object_id: 'wb-1' },
      occurred_at: this.setHour(baseDate, hour).toISOString(),
      metadata: { session_id: 'lesson-1', participant_count: 25 },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    };
  }

  private setHour(date: Date, hour: number): Date {
    const result = new Date(date);
    result.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), 0, 0);
    return result;
  }

  async clearDemoData(userId: string): Promise<{ message: string }> {
    this.logger.log(`Clear demo data requested for ${userId} (not implemented - events are in Redis streams)`);
    return { message: 'Event streams cannot be selectively cleared. Events will expire based on TTL.' };
  }
}

export default DemoDataService;
export { DEMO_USER_SETS };
export type { DemoScenario, DemoUserSet, UserScenarioConfig } from './demo-user-sets';
export type { GenerateDemoOptions, GenerateDemoResult, BatchGenerateResult, AllUsersGenerateResult };
