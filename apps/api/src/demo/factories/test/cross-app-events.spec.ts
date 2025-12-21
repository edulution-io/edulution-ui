/*
 * LICENSE PLACEHOLDER
 */

import {
  createConferenceEvent,
  createSurveyEvent,
  createProjectEvent,
  createClassEvent,
  createExamSessionEvent,
  createMailWithAttachmentsEvent,
  createImportantBulletinEvent,
} from '../cross-app-events.factory';

describe('Cross-App Event Factories', () => {
  const baseOpts = {
    userId: 'test-user',
    baseDate: new Date('2025-03-15T08:00:00Z'),
  };

  describe('createConferenceEvent', () => {
    it('should create valid conference event', () => {
      const event = createConferenceEvent({
        ...baseOpts,
        subjectName: 'Mathematik',
      });

      expect(event.type).toBe('conference.created');
      expect(event.source).toBe('conferences');
      expect(event.user_id).toBe('test-user');
      expect(event.metadata?.subject_name).toBe('Mathematik');
      expect(event.object.object_id).toMatch(/^conf-/);
      expect(event.object.object_ref).toBe('mathematik');
    });

    it('should include participants in payload', () => {
      const event = createConferenceEvent({
        ...baseOpts,
        subjectName: 'Deutsch',
        participants: ['student-1', 'student-2'],
      });

      expect(event.metadata?.participant_count).toBe(2);
      expect(event.payload?.participants).toEqual(['student-1', 'student-2']);
    });

    it('should set scheduled_at based on hour option', () => {
      const event = createConferenceEvent({
        ...baseOpts,
        hour: 14,
        subjectName: 'Englisch',
      });

      expect(event.metadata?.scheduled_at).toBeDefined();
      expect(event.metadata?.scheduled_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('createSurveyEvent', () => {
    it('should create valid survey event', () => {
      const event = createSurveyEvent({
        ...baseOpts,
        title: 'Feedback Survey',
      });

      expect(event.type).toBe('survey.created');
      expect(event.source).toBe('surveys');
      expect(event.metadata?.title).toBe('Feedback Survey');
      expect(event.object.object_id).toMatch(/^survey-/);
    });

    it('should include target groups in payload', () => {
      const event = createSurveyEvent({
        ...baseOpts,
        title: 'Test',
        targetGroups: ['teachers', 'students'],
      });

      expect(event.metadata?.target_group_count).toBe(2);
      expect(event.payload?.target_groups).toEqual(['teachers', 'students']);
    });
  });

  describe('createProjectEvent', () => {
    it('should create valid project event', () => {
      const event = createProjectEvent({
        ...baseOpts,
        projectName: 'Jahrbuch 2025',
      });

      expect(event.type).toBe('project.created');
      expect(event.source).toBe('system');
      expect(event.metadata?.project_name).toBe('Jahrbuch 2025');
      expect(event.object.object_id).toMatch(/^proj-/);
    });

    it('should include members in payload', () => {
      const event = createProjectEvent({
        ...baseOpts,
        projectName: 'Test Project',
        members: ['user-1', 'user-2', 'user-3'],
      });

      expect(event.metadata?.member_count).toBe(3);
      expect(event.payload?.members).toEqual(['user-1', 'user-2', 'user-3']);
    });
  });

  describe('createClassEvent', () => {
    it('should create valid class event', () => {
      const event = createClassEvent({
        ...baseOpts,
        className: '8a',
      });

      expect(event.type).toBe('class.created');
      expect(event.source).toBe('system');
      expect(event.metadata?.class_name).toBe('8a');
      expect(event.metadata?.class_id).toBe('class-8a');
    });

    it('should normalize class id', () => {
      const event = createClassEvent({
        ...baseOpts,
        className: 'Class 10 B',
      });

      expect(event.metadata?.class_id).toBe('class-class-10-b');
    });

    it('should include students and teachers in payload', () => {
      const event = createClassEvent({
        ...baseOpts,
        className: '9a',
        students: ['s1', 's2', 's3'],
        teachers: ['t1', 't2'],
      });

      expect(event.metadata?.student_count).toBe(3);
      expect(event.metadata?.teacher_count).toBe(2);
      expect(event.payload?.students).toEqual(['s1', 's2', 's3']);
      expect(event.payload?.teachers).toEqual(['t1', 't2']);
    });

    it('should default teachers to userId', () => {
      const event = createClassEvent({
        ...baseOpts,
        className: '10a',
      });

      expect(event.payload?.teachers).toEqual(['test-user']);
      expect(event.metadata?.teacher_count).toBe(1);
    });
  });

  describe('createExamSessionEvent', () => {
    it('should have is_exam=true', () => {
      const event = createExamSessionEvent({
        ...baseOpts,
        className: '10a',
      });

      expect(event.type).toBe('session.started');
      expect(event.source).toBe('system');
      expect(event.metadata?.is_exam).toBe(true);
      expect(event.metadata?.class_name).toBe('10a');
      expect(event.sensitivity).toBe('medium');
    });

    it('should include students in payload', () => {
      const event = createExamSessionEvent({
        ...baseOpts,
        className: '10b',
        students: ['s1', 's2', 's3'],
      });

      expect(event.metadata?.student_count).toBe(3);
      expect(event.payload?.students).toEqual(['s1', 's2', 's3']);
    });

    it('should set scheduled_at based on hour', () => {
      const event = createExamSessionEvent({
        ...baseOpts,
        hour: 9,
        className: '10a',
      });

      expect(event.metadata?.scheduled_at).toBeDefined();
      expect(event.metadata?.scheduled_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('createMailWithAttachmentsEvent', () => {
    it('should have has_attachments=true', () => {
      const event = createMailWithAttachmentsEvent({
        ...baseOpts,
        subject: 'Test Mail',
        attachments: [{ filename: 'test.pdf', size: 1000 }],
      });

      expect(event.type).toBe('mail.received');
      expect(event.source).toBe('mail');
      expect(event.metadata?.has_attachments).toBe(true);
      expect(event.metadata?.subject).toBe('Test Mail');
      expect(event.sensitivity).toBe('medium');
    });

    it('should include attachments in payload with temp_path', () => {
      const event = createMailWithAttachmentsEvent({
        ...baseOpts,
        subject: 'Files',
        attachments: [
          { filename: 'doc.pdf', size: 1000 },
          { filename: 'image.png', size: 2000 },
        ],
      });

      expect(event.metadata?.attachment_count).toBe(2);
      const attachments = event.payload?.attachments as Array<{
        filename: string;
        temp_path: string;
        size: number;
      }>;
      expect(attachments).toHaveLength(2);
      expect(attachments[0].filename).toBe('doc.pdf');
      expect(attachments[0].temp_path).toContain('/tmp/attachments/');
      expect(attachments[0].size).toBe(1000);
    });
  });

  describe('createImportantBulletinEvent', () => {
    it('should have is_important=true', () => {
      const event = createImportantBulletinEvent({
        ...baseOpts,
        title: 'Urgent Notice',
        targetGroups: [{ group_id: 'g1', name: 'Group 1', chat_id: 'c1' }],
      });

      expect(event.type).toBe('bulletin.created');
      expect(event.source).toBe('bulletin');
      expect(event.metadata?.is_important).toBe(true);
      expect(event.metadata?.title).toBe('Urgent Notice');
    });

    it('should include target groups in payload', () => {
      const event = createImportantBulletinEvent({
        ...baseOpts,
        title: 'Notice',
        targetGroups: [
          { group_id: 'teachers', name: 'Teachers', chat_id: 'chat-t' },
          { group_id: 'students', name: 'Students', chat_id: 'chat-s' },
        ],
      });

      expect(event.metadata?.target_group_count).toBe(2);
      const groups = event.payload?.target_groups as Array<{
        group_id: string;
        name: string;
        chat_id: string;
      }>;
      expect(groups).toHaveLength(2);
      expect(groups[0].group_id).toBe('teachers');
      expect(groups[1].chat_id).toBe('chat-s');
    });
  });

  describe('All factories', () => {
    it('should generate unique object IDs', () => {
      const event1 = createConferenceEvent({ ...baseOpts, subjectName: 'Math' });
      const event2 = createConferenceEvent({ ...baseOpts, subjectName: 'Math' });

      expect(event1.object.object_id).not.toBe(event2.object.object_id);
    });

    it('should use default date when baseDate not provided', () => {
      const event = createConferenceEvent({
        userId: 'test-user',
        subjectName: 'Math',
      });

      expect(event.metadata?.scheduled_at).toBeDefined();
    });
  });
});
