/*
 * LICENSE PLACEHOLDER
 */

import { z } from 'zod';

const McpCapability = z.enum([
  'files.create_folder',
  'files.create_file',
  'files.copy_file',
  'files.move_file',
  'files.rename_file',
  'files.delete_file',
  'files.public_share_create',

  'chat.group_create',
  'chat.user_create',
  'chat.send_message',

  'conference.create',
  'conference.start',
  'conference.join',

  'bulletin.create',
  'bulletin.update',

  'survey.create',

  'mail.sync_job_create',

  'lmn.start_exam',
  'lmn.stop_exam',
  'lmn.toggle_project',
  'lmn.add_management_group',
]);

type McpCapabilityType = z.infer<typeof McpCapability>;

const ActionStepSchema = z.object({
  step_id: z.string().min(1),
  capability: McpCapability,
  description: z.string().max(200),
  params: z.record(z.unknown()),
  depends_on: z.array(z.string()).default([]),
  optional: z.boolean().default(false),
});

type ActionStep = z.infer<typeof ActionStepSchema>;

const ActionProposalContextSchema = z.object({
  trigger_event_id: z.string(),
  trigger_action: z.string(),
  source: z.string(),
});

type ActionProposalContext = z.infer<typeof ActionProposalContextSchema>;

const RiskLevel = z.enum(['low', 'medium', 'high']);
type RiskLevelType = z.infer<typeof RiskLevel>;

const PolicyGate = z.enum([
  'role_required:teacher',
  'role_required:admin',
  'time_window_check',
  'rate_limit',
  'confirmation_required',
  'two_factor_required',
]);
type PolicyGateType = z.infer<typeof PolicyGate>;

const ReversibleStatus = z.enum(['full', 'partial', 'none']);
type ReversibleStatusType = z.infer<typeof ReversibleStatus>;

const ActionProposalSchema = z.object({
  proposal_id: z.string().min(1),
  title: z.string().max(100),
  description: z.string().max(300),
  steps: z.array(ActionStepSchema).min(1),
  requires_approval: z.literal(true),
  context: ActionProposalContextSchema,
  estimated_impact: z.enum(['low', 'medium', 'high']),
  reversible: ReversibleStatus,
  risk: RiskLevel,
  policy: z.array(PolicyGate).default([]),
  audit_required: z.boolean().default(false),
});

type ActionProposal = z.infer<typeof ActionProposalSchema>;

function createActionStep(
  stepId: string,
  capability: McpCapabilityType,
  description: string,
  params: Record<string, unknown>,
  options: { dependsOn?: string[]; optional?: boolean } = {},
): ActionStep {
  return {
    step_id: stepId,
    capability,
    description,
    params,
    depends_on: options.dependsOn || [],
    optional: options.optional || false,
  };
}

interface CreateActionProposalOptions {
  impact?: RiskLevelType;
  reversible?: ReversibleStatusType;
  risk?: RiskLevelType;
  policy?: PolicyGateType[];
  auditRequired?: boolean;
}

function createActionProposal(
  proposalId: string,
  title: string,
  description: string,
  steps: ActionStep[],
  context: ActionProposalContext,
  options: CreateActionProposalOptions = {},
): ActionProposal {
  return {
    proposal_id: proposalId,
    title,
    description,
    steps,
    requires_approval: true,
    context,
    estimated_impact: options.impact || 'low',
    reversible: options.reversible || 'full',
    risk: options.risk || 'low',
    policy: options.policy || [],
    audit_required: options.auditRequired || false,
  };
}

export {
  McpCapability,
  ActionStepSchema,
  ActionProposalContextSchema,
  ActionProposalSchema,
  RiskLevel,
  PolicyGate,
  ReversibleStatus,
  createActionStep,
  createActionProposal,
};

export type {
  McpCapabilityType,
  ActionStep,
  ActionProposalContext,
  ActionProposal,
  RiskLevelType,
  PolicyGateType,
  ReversibleStatusType,
};
