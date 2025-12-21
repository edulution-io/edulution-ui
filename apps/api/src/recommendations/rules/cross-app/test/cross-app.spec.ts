/*
 * LICENSE PLACEHOLDER
 */

import ConferenceSetupRule from '../conference-setup.rule';
import ClassSetupRule from '../class-setup.rule';
import SessionExamRule from '../session-exam.rule';
import MailAttachmentRule from '../mail-attachment.rule';
import SurveyAnnounceRule from '../survey-announce.rule';
import ProjectSetupRule from '../project-setup.rule';
import BulletinNotifyRule from '../bulletin-notify.rule';
import type { ConferenceEvent } from '../conference-setup.rule';
import type { ClassEvent } from '../class-setup.rule';
import type { SessionEvent } from '../session-exam.rule';
import type { MailEvent } from '../mail-attachment.rule';
import type { SurveyEvent } from '../survey-announce.rule';
import type { ProjectEvent } from '../project-setup.rule';
import type { BulletinEvent } from '../bulletin-notify.rule';

const createMockRedis = () => ({
  exists: jest.fn().mockResolvedValue(0),
  setex: jest.fn().mockResolvedValue('OK'),
  connect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
});

describe('Cross-App Rules', () => {
  describe('ConferenceSetupRule', () => {
    let rule: ConferenceSetupRule;
    let mockRedis: ReturnType<typeof createMockRedis>;

    beforeEach(async () => {
      mockRedis = createMockRedis();
      rule = new ConferenceSetupRule();
      (rule as unknown as { redis: typeof mockRedis }).redis = mockRedis;
    });

    it('should create folder + chat proposal for new conference', async () => {
      const event: ConferenceEvent = {
        event_id: 'evt-1',
        action: 'conference.created',
        source: 'conference',
        conference_id: 'conf-123',
        subject_name: 'Mathe',
        scheduled_at: '2025-03-15T10:00:00Z',
        occurred_at: '2025-01-10T08:00:00Z',
        participants: ['user-1', 'user-2'],
      };

      const candidate = await rule.evaluate('user-1', event);

      expect(candidate).not.toBeNull();
      expect(candidate!.action_proposal).toBeDefined();
      expect(candidate!.action_proposal!.steps).toHaveLength(2);
      expect(candidate!.action_proposal!.steps[0].capability).toBe('files.create_folder');
      expect(candidate!.action_proposal!.steps[1].capability).toBe('chat.group_create');
    });

    it('should skip duplicate events', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const event: ConferenceEvent = {
        event_id: 'evt-1',
        action: 'conference.created',
        source: 'conference',
        conference_id: 'conf-123',
        subject_name: 'Mathe',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);
      expect(candidate).toBeNull();
    });

    it('should ignore non-created events', async () => {
      const event: ConferenceEvent = {
        event_id: 'evt-1',
        action: 'conference.updated',
        source: 'conference',
        conference_id: 'conf-123',
        subject_name: 'Mathe',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);
      expect(candidate).toBeNull();
    });

    it('should include explainability', async () => {
      const event: ConferenceEvent = {
        event_id: 'evt-1',
        action: 'conference.created',
        source: 'conference',
        conference_id: 'conf-123',
        subject_name: 'Deutsch',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);

      expect(candidate!.explainability).toBeDefined();
      expect(candidate!.explainability!.rule_id).toBe('reco.cross.conference_setup');
      expect(candidate!.explainability!.evidence).toHaveLength(2);
    });
  });

  describe('ClassSetupRule', () => {
    let rule: ClassSetupRule;
    let mockRedis: ReturnType<typeof createMockRedis>;

    beforeEach(async () => {
      mockRedis = createMockRedis();
      rule = new ClassSetupRule();
      (rule as unknown as { redis: typeof mockRedis }).redis = mockRedis;
    });

    it('should create 5-step proposal for new class', async () => {
      const event: ClassEvent = {
        event_id: 'evt-1',
        action: 'class.created',
        source: 'lmn',
        class_id: 'class-8a',
        class_name: '8a',
        occurred_at: '2025-01-10T08:00:00Z',
        students: ['s1', 's2'],
        teachers: ['t1'],
      };

      const candidate = await rule.evaluate('user-1', event);

      expect(candidate).not.toBeNull();
      expect(candidate!.action_proposal!.steps).toHaveLength(5);

      const capabilities = candidate!.action_proposal!.steps.map((s) => s.capability);
      expect(capabilities.filter((c) => c === 'files.create_folder')).toHaveLength(3);
      expect(capabilities).toContain('chat.group_create');
      expect(capabilities).toContain('bulletin.create');
    });

    it('should have correct dependencies', async () => {
      const event: ClassEvent = {
        event_id: 'evt-1',
        action: 'class.created',
        source: 'lmn',
        class_id: 'class-8a',
        class_name: '8a',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);
      const {steps} = (candidate!.action_proposal!);

      const materialsStep = steps.find((s) => s.step_id === 'create_materials_folder');
      expect(materialsStep!.depends_on).toContain('create_class_folder');

      const submissionsStep = steps.find((s) => s.step_id === 'create_submissions_folder');
      expect(submissionsStep!.depends_on).toContain('create_class_folder');
    });

    it('should mark welcome bulletin as optional', async () => {
      const event: ClassEvent = {
        event_id: 'evt-1',
        action: 'class.created',
        source: 'lmn',
        class_id: 'class-8a',
        class_name: '8a',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);
      const bulletinStep = candidate!.action_proposal!.steps.find(
        (s) => s.step_id === 'create_welcome_bulletin',
      );

      expect(bulletinStep!.optional).toBe(true);
    });
  });

  describe('SessionExamRule', () => {
    let rule: SessionExamRule;
    let mockRedis: ReturnType<typeof createMockRedis>;

    beforeEach(async () => {
      mockRedis = createMockRedis();
      rule = new SessionExamRule();
      (rule as unknown as { redis: typeof mockRedis }).redis = mockRedis;
    });

    it('should only trigger for exam sessions', async () => {
      const normalSession: SessionEvent = {
        event_id: 'evt-1',
        action: 'session.started',
        source: 'lmn',
        session_id: 'sess-1',
        class_name: '8a',
        is_exam: false,
        occurred_at: '2025-01-10T08:00:00Z',
      };

      expect(await rule.evaluate('user-1', normalSession)).toBeNull();

      const examSession: SessionEvent = { ...normalSession, is_exam: true };
      const candidate = await rule.evaluate('user-1', examSession);
      expect(candidate).not.toBeNull();
    });

    it('should have high impact rating', async () => {
      const event: SessionEvent = {
        event_id: 'evt-1',
        action: 'session.started',
        source: 'lmn',
        session_id: 'sess-1',
        class_name: '8a',
        is_exam: true,
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);
      expect(candidate!.action_proposal!.estimated_impact).toBe('high');
    });

    it('should create folder + exam mode steps', async () => {
      const event: SessionEvent = {
        event_id: 'evt-1',
        action: 'session.started',
        source: 'lmn',
        session_id: 'sess-1',
        class_name: '8a',
        is_exam: true,
        occurred_at: '2025-01-10T08:00:00Z',
        students: ['s1', 's2'],
      };

      const candidate = await rule.evaluate('user-1', event);
      expect(candidate!.action_proposal!.steps).toHaveLength(2);
      expect(candidate!.action_proposal!.steps[0].capability).toBe('files.create_folder');
      expect(candidate!.action_proposal!.steps[1].capability).toBe('lmn.start_exam');
    });
  });

  describe('MailAttachmentRule', () => {
    let rule: MailAttachmentRule;
    let mockRedis: ReturnType<typeof createMockRedis>;

    beforeEach(async () => {
      mockRedis = createMockRedis();
      rule = new MailAttachmentRule();
      (rule as unknown as { redis: typeof mockRedis }).redis = mockRedis;
    });

    it('should create step per attachment', async () => {
      const event: MailEvent = {
        event_id: 'evt-1',
        action: 'mail.received',
        source: 'mail',
        mail_id: 'mail-123',
        subject: 'Test Email',
        occurred_at: '2025-01-10T08:00:00Z',
        has_attachments: true,
        attachments: [
          { filename: 'doc1.pdf', temp_path: '/tmp/doc1.pdf', size: 1000 },
          { filename: 'doc2.pdf', temp_path: '/tmp/doc2.pdf', size: 2000 },
        ],
      };

      const candidate = await rule.evaluate('user-1', event);
      expect(candidate!.action_proposal!.steps).toHaveLength(2);
      expect(candidate!.action_proposal!.steps[0].capability).toBe('files.copy_file');
      expect(candidate!.action_proposal!.steps[1].capability).toBe('files.copy_file');
    });

    it('should ignore mails without attachments', async () => {
      const event: MailEvent = {
        event_id: 'evt-1',
        action: 'mail.received',
        source: 'mail',
        mail_id: 'mail-123',
        subject: 'Test Email',
        occurred_at: '2025-01-10T08:00:00Z',
        has_attachments: false,
      };

      expect(await rule.evaluate('user-1', event)).toBeNull();
    });

    it('should ignore empty attachments array', async () => {
      const event: MailEvent = {
        event_id: 'evt-1',
        action: 'mail.received',
        source: 'mail',
        mail_id: 'mail-123',
        subject: 'Test Email',
        occurred_at: '2025-01-10T08:00:00Z',
        has_attachments: true,
        attachments: [],
      };

      expect(await rule.evaluate('user-1', event)).toBeNull();
    });

    it('should mark multiple attachments as optional', async () => {
      const event: MailEvent = {
        event_id: 'evt-1',
        action: 'mail.received',
        source: 'mail',
        mail_id: 'mail-123',
        subject: 'Test Email',
        occurred_at: '2025-01-10T08:00:00Z',
        has_attachments: true,
        attachments: [
          { filename: 'doc1.pdf', temp_path: '/tmp/doc1.pdf', size: 1000 },
          { filename: 'doc2.pdf', temp_path: '/tmp/doc2.pdf', size: 2000 },
        ],
      };

      const candidate = await rule.evaluate('user-1', event);
      expect(candidate!.action_proposal!.steps[0].optional).toBe(true);
      expect(candidate!.action_proposal!.steps[1].optional).toBe(true);
    });
  });

  describe('SurveyAnnounceRule', () => {
    let rule: SurveyAnnounceRule;
    let mockRedis: ReturnType<typeof createMockRedis>;

    beforeEach(async () => {
      mockRedis = createMockRedis();
      rule = new SurveyAnnounceRule();
      (rule as unknown as { redis: typeof mockRedis }).redis = mockRedis;
    });

    it('should create bulletin step for new survey', async () => {
      const event: SurveyEvent = {
        event_id: 'evt-1',
        action: 'survey.created',
        source: 'survey',
        survey_id: 'survey-123',
        title: 'Feedback Survey',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);

      expect(candidate).not.toBeNull();
      expect(candidate!.action_proposal!.steps).toHaveLength(1);
      expect(candidate!.action_proposal!.steps[0].capability).toBe('bulletin.create');
    });

    it('should ignore non-created events', async () => {
      const event: SurveyEvent = {
        event_id: 'evt-1',
        action: 'survey.updated',
        source: 'survey',
        survey_id: 'survey-123',
        title: 'Feedback Survey',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      expect(await rule.evaluate('user-1', event)).toBeNull();
    });
  });

  describe('ProjectSetupRule', () => {
    let rule: ProjectSetupRule;
    let mockRedis: ReturnType<typeof createMockRedis>;

    beforeEach(async () => {
      mockRedis = createMockRedis();
      rule = new ProjectSetupRule();
      (rule as unknown as { redis: typeof mockRedis }).redis = mockRedis;
    });

    it('should create folder + chat + share steps', async () => {
      const event: ProjectEvent = {
        event_id: 'evt-1',
        action: 'project.created',
        source: 'lmn',
        project_id: 'proj-123',
        project_name: 'Science Fair',
        occurred_at: '2025-01-10T08:00:00Z',
        members: ['m1', 'm2'],
      };

      const candidate = await rule.evaluate('user-1', event);

      expect(candidate).not.toBeNull();
      expect(candidate!.action_proposal!.steps).toHaveLength(3);
      expect(candidate!.action_proposal!.steps[0].capability).toBe('files.create_folder');
      expect(candidate!.action_proposal!.steps[1].capability).toBe('chat.group_create');
      expect(candidate!.action_proposal!.steps[2].capability).toBe('files.public_share_create');
    });

    it('should have share step depend on folder creation', async () => {
      const event: ProjectEvent = {
        event_id: 'evt-1',
        action: 'project.created',
        source: 'lmn',
        project_id: 'proj-123',
        project_name: 'Science Fair',
        occurred_at: '2025-01-10T08:00:00Z',
      };

      const candidate = await rule.evaluate('user-1', event);
      const shareStep = candidate!.action_proposal!.steps.find(
        (s) => s.capability === 'files.public_share_create',
      );

      expect(shareStep!.depends_on).toContain('create_folder');
      expect(shareStep!.optional).toBe(true);
    });
  });

  describe('BulletinNotifyRule', () => {
    let rule: BulletinNotifyRule;
    let mockRedis: ReturnType<typeof createMockRedis>;

    beforeEach(async () => {
      mockRedis = createMockRedis();
      rule = new BulletinNotifyRule();
      (rule as unknown as { redis: typeof mockRedis }).redis = mockRedis;
    });

    it('should create message step per group with chat', async () => {
      const event: BulletinEvent = {
        event_id: 'evt-1',
        action: 'bulletin.created',
        source: 'bulletin',
        bulletin_id: 'bulletin-123',
        title: 'Important Notice',
        is_important: true,
        occurred_at: '2025-01-10T08:00:00Z',
        target_groups: [
          { group_id: 'g1', name: 'Teachers', chat_id: 'chat-1' },
          { group_id: 'g2', name: 'Students', chat_id: 'chat-2' },
          { group_id: 'g3', name: 'Parents' }, // No chat_id
        ],
      };

      const candidate = await rule.evaluate('user-1', event);

      expect(candidate).not.toBeNull();
      expect(candidate!.action_proposal!.steps).toHaveLength(2);
      expect(candidate!.action_proposal!.steps[0].capability).toBe('chat.send_message');
      expect(candidate!.action_proposal!.steps[1].capability).toBe('chat.send_message');
    });

    it('should only trigger for important bulletins', async () => {
      const event: BulletinEvent = {
        event_id: 'evt-1',
        action: 'bulletin.created',
        source: 'bulletin',
        bulletin_id: 'bulletin-123',
        title: 'Regular Notice',
        is_important: false,
        occurred_at: '2025-01-10T08:00:00Z',
        target_groups: [{ group_id: 'g1', name: 'Teachers', chat_id: 'chat-1' }],
      };

      expect(await rule.evaluate('user-1', event)).toBeNull();
    });

    it('should skip if no groups have chat_id', async () => {
      const event: BulletinEvent = {
        event_id: 'evt-1',
        action: 'bulletin.created',
        source: 'bulletin',
        bulletin_id: 'bulletin-123',
        title: 'Important Notice',
        is_important: true,
        occurred_at: '2025-01-10T08:00:00Z',
        target_groups: [{ group_id: 'g1', name: 'Parents' }],
      };

      expect(await rule.evaluate('user-1', event)).toBeNull();
    });

    it('should not be reversible (messages cannot be unsent)', async () => {
      const event: BulletinEvent = {
        event_id: 'evt-1',
        action: 'bulletin.created',
        source: 'bulletin',
        bulletin_id: 'bulletin-123',
        title: 'Important Notice',
        is_important: true,
        occurred_at: '2025-01-10T08:00:00Z',
        target_groups: [{ group_id: 'g1', name: 'Teachers', chat_id: 'chat-1' }],
      };

      const candidate = await rule.evaluate('user-1', event);
      expect(candidate!.action_proposal!.reversible).toBe('none');
    });
  });
});
