/*
 * LICENSE PLACEHOLDER
 */

import {
  EventBuilder,
  EVENT_SOURCES,
  FILE_EVENT_TYPES,
  MAIL_EVENT_TYPES,
  CHAT_EVENT_TYPES,
  CALDAV_EVENT_TYPES,
} from '@edulution/events';
import type { Event, EventSource } from '@edulution/events';
import DemoDataGenerator from '../cli/demo-data-generator';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('DemoDataGenerator', () => {
  describe('event structure alignment', () => {
    let generator: DemoDataGenerator;
    let events: Event[];

    beforeAll(() => {
      generator = new DemoDataGenerator({
        userIds: ['test-user-1', 'test-user-2'],
        threadCount: 2,
        messagesPerThread: 2,
        chatChannels: 1,
        messagesPerChannel: 2,
        calendarEventsPerUser: 2,
        fileOperationsPerUser: 2,
        timeRangeHours: 24,
        enableScenarios: true,
      });
      events = generator.generateAll();
    });

    it('should generate events', () => {
      expect(events.length).toBeGreaterThan(0);
    });

    it('should generate full UUID v4 event_ids', () => {
      for (const event of events) {
        expect(event.event_id).toMatch(UUID_REGEX);
      }
    });

    it('should include all required fields', () => {
      for (const event of events) {
        expect(event.event_id).toBeDefined();
        expect(event.schema_version).toBe('1.0.0');
        expect(event.occurred_at).toMatch(ISO_TIMESTAMP_REGEX);
        expect(event.received_at).toMatch(ISO_TIMESTAMP_REGEX);
        expect(event.user_id).toBeDefined();
        expect(event.source).toBeDefined();
        expect(event.type).toBeDefined();
        expect(event.object).toBeDefined();
        expect(event.object.object_type).toBeDefined();
        expect(event.object.object_id).toBeDefined();
        expect(event.correlation_id).toBeDefined();
        expect(event.sensitivity).toBeDefined();
      }
    });

    it('should use valid event sources', () => {
      const validSources = Object.values(EVENT_SOURCES);
      for (const event of events) {
        expect(validSources).toContain(event.source);
      }
    });

    it('should use domain.action event type format', () => {
      for (const event of events) {
        expect(event.type).toMatch(/^[a-z]+\.[a-z_]+$/);
      }
    });

    it('should include correlation_id on all events', () => {
      for (const event of events) {
        expect(event.correlation_id).toBeDefined();
        expect(event.correlation_id.length).toBeGreaterThan(10);
      }
    });
  });

  describe('provenance metadata', () => {
    let generator: DemoDataGenerator;
    let events: Event[];

    beforeAll(() => {
      generator = new DemoDataGenerator({
        userIds: ['test-user-1'],
        threadCount: 1,
        messagesPerThread: 1,
        chatChannels: 1,
        messagesPerChannel: 1,
        calendarEventsPerUser: 1,
        fileOperationsPerUser: 1,
        timeRangeHours: 24,
        enableScenarios: true,
      });
      events = generator.generateAll();
    });

    it('should mark all events with _data_source=demo', () => {
      for (const event of events) {
        expect(event.metadata?._data_source).toBe('demo');
      }
    });

    it('should mark scenario events with _scenario_id', () => {
      const scenarioEvents = events.filter((e) => e.metadata?._scenario_id);
      expect(scenarioEvents.length).toBeGreaterThan(0);

      for (const event of scenarioEvents) {
        expect(event.metadata?._scenario_id).toMatch(/^SC-[A-Z-]+-[a-f0-9]{8}$/i);
      }
    });
  });

  describe('file events', () => {
    let generator: DemoDataGenerator;
    let events: Event[];

    beforeAll(() => {
      generator = new DemoDataGenerator({
        userIds: ['test-user-1'],
        threadCount: 0,
        chatChannels: 0,
        calendarEventsPerUser: 0,
        fileOperationsPerUser: 5,
        enableScenarios: false,
      });
      events = generator.generateAll();
    });

    it('should generate file events', () => {
      const fileEvents = events.filter((e) => e.source === EVENT_SOURCES.FILES);
      expect(fileEvents.length).toBeGreaterThan(0);
    });

    it('should use proper file paths in object_ref', () => {
      const fileEvents = events.filter((e) => e.source === EVENT_SOURCES.FILES);
      for (const event of fileEvents) {
        expect(event.object.object_ref).toMatch(/^\/users\/[\w-]+\/(documents|projects|archive)/);
      }
    });

    it('should include file metadata', () => {
      const createEvents = events.filter(
        (e) => e.source === EVENT_SOURCES.FILES && e.type === FILE_EVENT_TYPES.CREATED,
      );

      for (const event of createEvents) {
        expect(event.metadata?.file_name).toBeDefined();
        expect(event.metadata?.file_size).toBeDefined();
        expect(event.metadata?.mime_type).toBeDefined();
      }
    });
  });

  describe('mail events', () => {
    let generator: DemoDataGenerator;
    let events: Event[];

    beforeAll(() => {
      generator = new DemoDataGenerator({
        userIds: ['test-user-1', 'test-user-2'],
        threadCount: 2,
        messagesPerThread: 3,
        chatChannels: 0,
        calendarEventsPerUser: 0,
        fileOperationsPerUser: 0,
        enableScenarios: false,
      });
      events = generator.generateAll();
    });

    it('should generate mail events', () => {
      const mailEvents = events.filter((e) => e.source === EVENT_SOURCES.MAIL);
      expect(mailEvents.length).toBeGreaterThan(0);
    });

    it('should include thread_id in context', () => {
      const mailEvents = events.filter((e) => e.source === EVENT_SOURCES.MAIL);
      for (const event of mailEvents) {
        expect(event.context?.thread_id).toBeDefined();
        expect(event.context?.thread_id).toMatch(UUID_REGEX);
      }
    });

    it('should use mail:// URI format in object_ref for emails', () => {
      const emailEvents = events.filter(
        (e) => e.source === EVENT_SOURCES.MAIL && e.object.object_type === 'email',
      );
      for (const event of emailEvents) {
        expect(event.object.object_ref).toMatch(/^mail:\/\/[\w-]+\/[\w-]+$/);
      }
    });
  });

  describe('chat events', () => {
    let generator: DemoDataGenerator;
    let events: Event[];

    beforeAll(() => {
      generator = new DemoDataGenerator({
        userIds: ['test-user-1'],
        threadCount: 0,
        chatChannels: 2,
        messagesPerChannel: 3,
        calendarEventsPerUser: 0,
        fileOperationsPerUser: 0,
        enableScenarios: false,
      });
      events = generator.generateAll();
    });

    it('should generate chat events', () => {
      const chatEvents = events.filter((e) => e.source === EVENT_SOURCES.CHAT);
      expect(chatEvents.length).toBeGreaterThan(0);
    });

    it('should use chat:// URI format in object_ref', () => {
      const chatEvents = events.filter((e) => e.source === EVENT_SOURCES.CHAT);
      for (const event of chatEvents) {
        expect(event.object.object_ref).toMatch(/^chat:\/\/[\w-]+\/[\w-]+$/);
      }
    });

    it('should include channel metadata', () => {
      const chatEvents = events.filter((e) => e.source === EVENT_SOURCES.CHAT);
      for (const event of chatEvents) {
        expect(event.metadata?.channel_id).toBeDefined();
        expect(event.metadata?.channel_name).toBeDefined();
      }
    });
  });

  describe('calendar events', () => {
    let generator: DemoDataGenerator;
    let events: Event[];

    beforeAll(() => {
      generator = new DemoDataGenerator({
        userIds: ['test-user-1'],
        threadCount: 0,
        chatChannels: 0,
        calendarEventsPerUser: 3,
        fileOperationsPerUser: 0,
        enableScenarios: false,
      });
      events = generator.generateAll();
    });

    it('should generate calendar events', () => {
      const calendarEvents = events.filter((e) => e.source === EVENT_SOURCES.CALDAV);
      expect(calendarEvents.length).toBeGreaterThan(0);
    });

    it('should include meeting_id in context', () => {
      const calendarEvents = events.filter((e) => e.source === EVENT_SOURCES.CALDAV);
      for (const event of calendarEvents) {
        expect(event.context?.meeting_id).toBeDefined();
        expect(event.context?.meeting_id).toMatch(UUID_REGEX);
      }
    });

    it('should include scheduling metadata', () => {
      const createEvents = events.filter(
        (e) => e.source === EVENT_SOURCES.CALDAV && e.type === CALDAV_EVENT_TYPES.EVENT_CREATED,
      );

      for (const event of createEvents) {
        expect(event.metadata?.scheduled_start).toBeDefined();
        expect(event.metadata?.scheduled_end).toBeDefined();
        expect(event.metadata?.duration_minutes).toBeDefined();
      }
    });
  });

  describe('coherent scenarios', () => {
    let generator: DemoDataGenerator;
    let events: Event[];

    beforeAll(() => {
      generator = new DemoDataGenerator({
        userIds: ['test-user-1', 'test-user-2'],
        threadCount: 0,
        chatChannels: 0,
        calendarEventsPerUser: 0,
        fileOperationsPerUser: 0,
        enableScenarios: true,
      });
      events = generator.generateAll();
    });

    it('should generate all three scenario types', () => {
      const scenarioIds = new Set<string>();
      for (const event of events) {
        const scenarioId = event.metadata?._scenario_id;
        if (typeof scenarioId === 'string') {
          scenarioIds.add(scenarioId);
        }
      }

      const ids = Array.from(scenarioIds);
      expect(ids.some((id) => id.startsWith('SC-EMAIL-AWAIT-'))).toBe(true);
      expect(ids.some((id) => id.startsWith('SC-MTG-PREP-'))).toBe(true);
      expect(ids.some((id) => id.startsWith('SC-CHAT-DISC-'))).toBe(true);
    });

    it('should group scenario events by correlation_id', () => {
      const scenarioEvents = events.filter((e) => e.metadata?._scenario_id);

      const byScenario = new Map<string, Event[]>();
      for (const event of scenarioEvents) {
        const scenarioId = event.metadata?._scenario_id as string;
        const existing = byScenario.get(scenarioId) || [];
        existing.push(event);
        byScenario.set(scenarioId, existing);
      }

      for (const [scenarioId, scenarioEvts] of byScenario) {
        const correlationIds = new Set(scenarioEvts.map((e) => e.correlation_id));
        expect(correlationIds.size).toBeLessThanOrEqual(2);
      }
    });

    it('should have email-await scenario with mail.received as last event', () => {
      const emailAwaitEvents = events.filter((e) =>
        (e.metadata?._scenario_id as string)?.startsWith('SC-EMAIL-AWAIT-'),
      );

      expect(emailAwaitEvents.length).toBeGreaterThanOrEqual(4);

      const sortedByTime = [...emailAwaitEvents].sort(
        (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
      );

      const lastEvent = sortedByTime[sortedByTime.length - 1];
      expect(lastEvent.type).toBe(MAIL_EVENT_TYPES.RECEIVED);
    });

    it('should have meeting-prep scenario with calendar event', () => {
      const meetingPrepEvents = events.filter((e) =>
        (e.metadata?._scenario_id as string)?.startsWith('SC-MTG-PREP-'),
      );

      expect(meetingPrepEvents.length).toBeGreaterThanOrEqual(3);

      const calendarEvent = meetingPrepEvents.find((e) => e.source === EVENT_SOURCES.CALDAV);
      expect(calendarEvent).toBeDefined();
      expect(calendarEvent?.type).toBe(CALDAV_EVENT_TYPES.EVENT_CREATED);
    });

    it('should have chat-discussion scenario with file.shared', () => {
      const chatDiscEvents = events.filter((e) =>
        (e.metadata?._scenario_id as string)?.startsWith('SC-CHAT-DISC-'),
      );

      expect(chatDiscEvents.length).toBeGreaterThanOrEqual(3);

      const fileSharedEvent = chatDiscEvents.find(
        (e) => e.source === EVENT_SOURCES.FILES && e.type === FILE_EVENT_TYPES.SHARED,
      );
      expect(fileSharedEvent).toBeDefined();
    });
  });

  describe('generateSummary', () => {
    it('should generate accurate summary', () => {
      const generator = new DemoDataGenerator({
        userIds: ['test-user-1'],
        threadCount: 2,
        messagesPerThread: 2,
        chatChannels: 1,
        messagesPerChannel: 2,
        calendarEventsPerUser: 2,
        fileOperationsPerUser: 2,
        enableScenarios: true,
      });

      const events = generator.generateAll();
      const summary = DemoDataGenerator.generateSummary(events);

      expect(summary.total).toBe(events.length);
      expect(Object.keys(summary.bySource).length).toBeGreaterThan(0);
      expect(Object.keys(summary.byType).length).toBeGreaterThan(0);
      expect(summary.timeRange.earliest).toBeDefined();
      expect(summary.timeRange.latest).toBeDefined();
      expect(summary.scenarios.length).toBeGreaterThan(0);
    });

    it('should collect scenario IDs', () => {
      const generator = new DemoDataGenerator({
        userIds: ['test-user-1', 'test-user-2'],
        enableScenarios: true,
      });

      const events = generator.generateAll();
      const summary = DemoDataGenerator.generateSummary(events);

      expect(summary.scenarios.length).toBe(3);
      expect(summary.scenarios.some((id) => id.startsWith('SC-EMAIL-AWAIT-'))).toBe(true);
      expect(summary.scenarios.some((id) => id.startsWith('SC-MTG-PREP-'))).toBe(true);
      expect(summary.scenarios.some((id) => id.startsWith('SC-CHAT-DISC-'))).toBe(true);
    });
  });

  describe('disabled scenarios', () => {
    it('should not generate scenarios when disabled', () => {
      const generator = new DemoDataGenerator({
        userIds: ['test-user-1'],
        threadCount: 1,
        chatChannels: 1,
        calendarEventsPerUser: 1,
        fileOperationsPerUser: 1,
        enableScenarios: false,
      });

      const events = generator.generateAll();
      const scenarioEvents = events.filter((e) => e.metadata?._scenario_id);

      expect(scenarioEvents.length).toBe(0);
    });
  });

  describe('production vs demo event comparison', () => {
    it('should match production event builder output structure', () => {
      const productionEvent = EventBuilder.create()
        .withUserId('prod-user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({
          object_type: 'file',
          object_id: 'file-123',
          object_ref: '/users/prod-user-1/documents/test.pdf',
        })
        .withCorrelationId('files-corr-test')
        .addMetadata('file_name', 'test.pdf')
        .addMetadata('file_size', 1024)
        .build();

      const generator = new DemoDataGenerator({
        userIds: ['demo-user-1'],
        fileOperationsPerUser: 1,
        threadCount: 0,
        chatChannels: 0,
        calendarEventsPerUser: 0,
        enableScenarios: false,
      });

      const demoEvents = generator.generateAll();
      const demoFileEvent = demoEvents.find(
        (e) => e.source === EVENT_SOURCES.FILES && e.type === FILE_EVENT_TYPES.CREATED,
      );

      expect(demoFileEvent).toBeDefined();

      const prodKeys = Object.keys(productionEvent).sort();
      const demoKeys = Object.keys(demoFileEvent).sort();
      expect(demoKeys).toEqual(prodKeys);

      expect(typeof demoFileEvent!.event_id).toBe(typeof productionEvent.event_id);
      expect(typeof demoFileEvent!.occurred_at).toBe(typeof productionEvent.occurred_at);
      expect(typeof demoFileEvent!.object).toBe(typeof productionEvent.object);
      expect(typeof demoFileEvent!.metadata).toBe(typeof productionEvent.metadata);
    });
  });
});
