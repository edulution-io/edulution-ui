/*
 * LICENSE PLACEHOLDER
 */

import ConferenceFolderRule from '../organization/conference-folder.rule';
import type { ConferenceEventInput } from '../organization/conference-folder.rule';

describe('ConferenceFolderRule', () => {
  let rule: ConferenceFolderRule;
  let mockAggregator: {
    isFolderSuggested: jest.Mock;
    markFolderSuggested: jest.Mock;
  };

  beforeEach(() => {
    mockAggregator = {
      isFolderSuggested: jest.fn().mockResolvedValue(false),
      markFolderSuggested: jest.fn().mockResolvedValue(undefined),
    };
    rule = new ConferenceFolderRule(mockAggregator as never);
  });

  it('should generate folder recommendation for Mathe conference', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Mathe',
      scheduled_at: '2025-03-15T10:00:00Z',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate).not.toBeNull();
    expect(candidate!.title).toBe('Create resources folder for Mathe');
    expect(candidate!.class).toBe('organization');
    expect(candidate!.action_proposal?.steps[0].params.name).toBe('Mathe_2025');
    expect(candidate!.action_proposal?.requires_approval).toBe(true);
  });

  it('should not emit duplicate recommendations', async () => {
    mockAggregator.isFolderSuggested.mockResolvedValue(true);

    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Mathe',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate).toBeNull();
  });

  it('should include explainability with event reference', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Deutsch',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.explainability.rule_id).toBe('reco.resources.conference_folder');
    expect(candidate!.explainability.rule_version).toBe('1.0.0');
    expect(candidate!.explainability.evidence[0].kind).toBe('event');
    expect(candidate!.explainability.evidence[0].refs[0].ref).toBe('evt-123');
    expect(candidate!.explainability.evidence[1].kind).toBe('heuristic');
    expect(candidate!.explainability.evidence[1].meta.name).toBe('Deutsch_2025');
  });

  it('should ignore non-created events', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.updated',
      conference_id: 'conf-456',
      subject_name: 'Mathe',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate).toBeNull();
  });

  it('should normalize subject name for folder', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Sport & Bewegung',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.action_proposal?.steps[0].params.name).toBe('Sport_Bewegung_2025');
  });

  it('should handle empty subject name', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: '',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate).toBeNull();
  });

  it('should handle whitespace-only subject name', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: '   ',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate).toBeNull();
  });

  it('should use scheduled_at for year extraction when available', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Englisch',
      scheduled_at: '2026-03-15T10:00:00Z',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.action_proposal?.steps[0].params.name).toBe('Englisch_2026');
  });

  it('should use occurred_at for year extraction when scheduled_at is missing', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Physik',
      occurred_at: '2025-06-15T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.action_proposal?.steps[0].params.name).toBe('Physik_2025');
  });

  it('should mark folder as suggested after generating recommendation', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Chemie',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    await rule.evaluate('user-1', event);

    expect(mockAggregator.markFolderSuggested).toHaveBeenCalledWith(
      'user-1',
      'chemie',
      '2025',
    );
  });

  it('should include context_id referencing conference', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Kunst',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.context_id).toBe('conf-456');
  });

  it('should include sources_involved', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Musik',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.sources_involved).toContain('conferences');
  });

  it('should include action_proposal with correct structure', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Geschichte',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.action_proposal).toMatchObject({
      proposal_id: 'reco.resources.conference_folder:conf-456',
      title: 'Create folder for Geschichte',
      requires_approval: true,
      estimated_impact: 'low',
      reversible: 'full',
      steps: [
        {
          step_id: 'create-folder',
          capability: 'files.create_folder',
          params: { name: 'Geschichte_2025', path: '/Ressourcen' },
        },
      ],
      context: {
        trigger_event_id: 'evt-123',
        trigger_action: 'conference.created',
        source: 'conferences',
      },
    });
  });

  it('should handle German umlauts in subject name', async () => {
    const event: ConferenceEventInput = {
      event_id: 'evt-123',
      action: 'conference.created',
      conference_id: 'conf-456',
      subject_name: 'Französisch',
      occurred_at: '2025-01-10T08:00:00Z',
    };

    const candidate = await rule.evaluate('user-1', event);

    expect(candidate!.action_proposal?.steps[0].params.name).toBe('Französisch_2025');
  });
});
