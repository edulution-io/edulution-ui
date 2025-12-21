/*
 * LICENSE PLACEHOLDER
 */

import type { RiskLevelType, PolicyGateType } from '@edulution/events';

interface RiskPolicyConfig {
  risk: RiskLevelType;
  policy: PolicyGateType[];
  audit_required: boolean;
  expires_hours: number;
}

const RISK_POLICY_CONFIG: Record<string, RiskPolicyConfig> = {
  'reco.cross.session_exam': {
    risk: 'high',
    policy: ['role_required:teacher', 'time_window_check', 'confirmation_required'],
    audit_required: true,
    expires_hours: 4,
  },

  'reco.cross.class_setup': {
    risk: 'medium',
    policy: ['role_required:teacher'],
    audit_required: true,
    expires_hours: 72,
  },

  'reco.cross.bulletin_notify': {
    risk: 'medium',
    policy: ['rate_limit'],
    audit_required: false,
    expires_hours: 24,
  },

  'reco.cross.survey_announce': {
    risk: 'medium',
    policy: [],
    audit_required: false,
    expires_hours: 48,
  },

  'reco.cross.conference_setup': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 12,
  },

  'reco.cross.project_setup': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 168,
  },

  'reco.cross.mail_attachment': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 24,
  },

  'reco.meeting.upcoming': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 2,
  },

  'reco.comm.awaiting_reply': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 48,
  },

  'reco.focus.low_activity': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 4,
  },

  'reco.focus.deep_work': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 4,
  },

  'reco.meeting.busy_schedule': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 12,
  },

  'reco.comm.high_volume': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 8,
  },

  'reco.planning.end_of_day': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 4,
  },

  'reco.cleanup.stale_threads': {
    risk: 'low',
    policy: [],
    audit_required: false,
    expires_hours: 48,
  },
};

const DEFAULT_RISK_POLICY: RiskPolicyConfig = {
  risk: 'low',
  policy: [],
  audit_required: false,
  expires_hours: 24,
};

function getRiskPolicyConfig(ruleId: string): RiskPolicyConfig {
  return RISK_POLICY_CONFIG[ruleId] || DEFAULT_RISK_POLICY;
}

function calculateExpiresAt(ruleId: string, createdAt: Date = new Date()): string {
  const config = getRiskPolicyConfig(ruleId);
  const expiresAt = new Date(createdAt.getTime() + config.expires_hours * 60 * 60 * 1000);
  return expiresAt.toISOString();
}

export {
  RISK_POLICY_CONFIG,
  DEFAULT_RISK_POLICY,
  getRiskPolicyConfig,
  calculateExpiresAt,
};

export type { RiskPolicyConfig };
