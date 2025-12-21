/*
 * LICENSE PLACEHOLDER
 */

import { Test, TestingModule } from '@nestjs/testing';
import DemoDataService from '../demo-data.service';
import EventsService from '../../events/events.service';
import RecommendationsService from '../../recommendations/recommendations.service';
import { CrossAppEvaluatorService } from '../../recommendations/rules/cross-app';

interface TestEvent {
  type: string;
  metadata: Record<string, unknown>;
}

describe('Cross-App Scenarios', () => {
  let service: DemoDataService;
  let eventsServiceMock: jest.Mocked<EventsService>;
  let ingestedEvents: TestEvent[] = [];

  beforeEach(async () => {
    ingestedEvents = [];

    eventsServiceMock = {
      ingestMany: jest.fn().mockImplementation((events: TestEvent[]) => {
        ingestedEvents.push(...events);
        return Promise.resolve({ successful: events.length, failed: 0 });
      }),
    } as unknown as jest.Mocked<EventsService>;

    const recommendationsServiceMock = {
      putCandidate: jest.fn().mockResolvedValue(undefined),
    };

    const crossAppEvaluatorMock = {
      evaluateEvents: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoDataService,
        {
          provide: EventsService,
          useValue: eventsServiceMock,
        },
        {
          provide: RecommendationsService,
          useValue: recommendationsServiceMock,
        },
        {
          provide: CrossAppEvaluatorService,
          useValue: crossAppEvaluatorMock,
        },
      ],
    }).compile();

    service = module.get<DemoDataService>(DemoDataService);

    // Mock Redis connection
    (service as unknown as { redis: unknown }).redis = {
      pipeline: () => ({
        hincrby: jest.fn().mockReturnThis(),
        hset: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        sadd: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
    };
  });

  describe('cross_app_full scenario', () => {
    it('should create 7 events', async () => {
      const result = await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
      });

      expect(result.eventsCreated).toBe(7);
      expect(result.scenario).toBe('cross_app_full');
      expect(result.userId).toBe('test-user');
    });

    it('should create one event of each type', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
      });

      const types = ingestedEvents.map((e) => e.type);

      expect(types).toContain('conference.created');
      expect(types).toContain('survey.created');
      expect(types).toContain('project.created');
      expect(types).toContain('class.created');
      expect(types).toContain('session.started');
      expect(types).toContain('mail.received');
      expect(types).toContain('bulletin.created');
    });

    it('should have is_exam=true for session event', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
      });

      const sessionEvent = ingestedEvents.find(
        (e) => e.type === 'session.started',
      ) as { metadata: { is_exam: boolean } };

      expect(sessionEvent.metadata.is_exam).toBe(true);
    });

    it('should have has_attachments=true for mail event', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
      });

      const mailEvent = ingestedEvents.find(
        (e) => e.type === 'mail.received',
      ) as { metadata: { has_attachments: boolean } };

      expect(mailEvent.metadata.has_attachments).toBe(true);
    });

    it('should have is_important=true for bulletin event', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
      });

      const bulletinEvent = ingestedEvents.find(
        (e) => e.type === 'bulletin.created',
      ) as { metadata: { is_important: boolean } };

      expect(bulletinEvent.metadata.is_important).toBe(true);
    });
  });

  describe('cross_app_teacher scenario', () => {
    it('should create 4 events', async () => {
      const result = await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_teacher',
      });

      expect(result.eventsCreated).toBe(4);
      expect(result.scenario).toBe('cross_app_teacher');
    });

    it('should create 2 conferences, 1 class, 1 exam', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_teacher',
      });

      const types = ingestedEvents.map((e) => e.type);

      const conferenceCount = types.filter((t) => t === 'conference.created').length;
      const classCount = types.filter((t) => t === 'class.created').length;
      const examCount = types.filter((t) => t === 'session.started').length;

      expect(conferenceCount).toBe(2);
      expect(classCount).toBe(1);
      expect(examCount).toBe(1);
    });
  });

  describe('cross_app_admin scenario', () => {
    it('should create 4 events', async () => {
      const result = await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_admin',
      });

      expect(result.eventsCreated).toBe(4);
      expect(result.scenario).toBe('cross_app_admin');
    });

    it('should create 2 surveys, 1 bulletin, 1 project', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_admin',
      });

      const types = ingestedEvents.map((e) => e.type);

      const surveyCount = types.filter((t) => t === 'survey.created').length;
      const bulletinCount = types.filter((t) => t === 'bulletin.created').length;
      const projectCount = types.filter((t) => t === 'project.created').length;

      expect(surveyCount).toBe(2);
      expect(bulletinCount).toBe(1);
      expect(projectCount).toBe(1);
    });
  });

  describe('conference_heavy scenario', () => {
    it('should create 5 events', async () => {
      const result = await service.generateDemoData({
        userId: 'test-user',
        scenario: 'conference_heavy',
      });

      expect(result.eventsCreated).toBe(5);
      expect(result.scenario).toBe('conference_heavy');
    });

    it('should create 5 conference events with different subjects', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'conference_heavy',
      });

      const conferenceEvents = ingestedEvents.filter((e) => e.type === 'conference.created');

      expect(conferenceEvents).toHaveLength(5);

      const subjects = conferenceEvents.map((e) => e.metadata.subject_name as string);
      expect(subjects).toContain('Mathematik');
      expect(subjects).toContain('Deutsch');
      expect(subjects).toContain('Englisch');
      expect(subjects).toContain('Physik');
      expect(subjects).toContain('Chemie');
    });
  });

  describe('exam_day scenario', () => {
    it('should create 4 events', async () => {
      const result = await service.generateDemoData({
        userId: 'test-user',
        scenario: 'exam_day',
      });

      expect(result.eventsCreated).toBe(4);
      expect(result.scenario).toBe('exam_day');
    });

    it('should create 4 exam sessions with different classes', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'exam_day',
      });

      const examEvents = ingestedEvents.filter((e) => e.type === 'session.started');

      expect(examEvents).toHaveLength(4);
      expect(examEvents.every((e) => e.metadata.is_exam === true)).toBe(true);

      const classes = examEvents.map((e) => e.metadata.class_name as string);
      expect(classes).toContain('8a');
      expect(classes).toContain('8b');
      expect(classes).toContain('9a');
      expect(classes).toContain('10b');
    });

    it('should schedule exams at different times', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'exam_day',
      });

      const examEvents = ingestedEvents.filter((e) => e.type === 'session.started');

      const times = examEvents.map((e) => e.metadata.scheduled_at as string);
      const uniqueTimes = new Set(times);

      expect(uniqueTimes.size).toBe(4);
    });
  });

  describe('date handling', () => {
    it('should use provided date', async () => {
      const testDate = new Date('2025-06-15');
      const result = await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
        date: testDate,
      });

      expect(result.date).toBe('2025-06-15');
    });

    it('should use current date when not provided', async () => {
      const result = await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
      });

      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('persist option', () => {
    it('should not call eventsService when persist=false', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
        persist: false,
      });

      expect(eventsServiceMock.ingestMany).not.toHaveBeenCalled();
    });

    it('should call eventsService when persist=true', async () => {
      await service.generateDemoData({
        userId: 'test-user',
        scenario: 'cross_app_full',
        persist: true,
      });

      expect(eventsServiceMock.ingestMany).toHaveBeenCalledTimes(1);
    });
  });
});
