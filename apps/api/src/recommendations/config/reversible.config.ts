/*
 * LICENSE PLACEHOLDER
 */

import type { McpCapabilityType, ReversibleStatusType } from '@edulution/events';

const REVERSIBLE_CAPABILITIES = new Set<McpCapabilityType>([
  'files.create_folder',
  'files.create_file',
  'files.copy_file',
]);

const PARTIALLY_REVERSIBLE_CAPABILITIES = new Set<McpCapabilityType>([
  'chat.group_create',
  'files.public_share_create',
  'conference.create',
]);

function isProposalReversible(steps: Array<{ capability: McpCapabilityType }>): boolean {
  return steps.every((step) => REVERSIBLE_CAPABILITIES.has(step.capability));
}

function isProposalPartiallyReversible(steps: Array<{ capability: McpCapabilityType }>): boolean {
  const reversibleSet = new Set([...REVERSIBLE_CAPABILITIES, ...PARTIALLY_REVERSIBLE_CAPABILITIES]);
  return steps.every((step) => reversibleSet.has(step.capability));
}

function getReversibleStatus(steps: Array<{ capability: McpCapabilityType }>): ReversibleStatusType {
  if (isProposalReversible(steps)) return 'full';
  if (isProposalPartiallyReversible(steps)) return 'partial';
  return 'none';
}

export {
  REVERSIBLE_CAPABILITIES,
  PARTIALLY_REVERSIBLE_CAPABILITIES,
  isProposalReversible,
  isProposalPartiallyReversible,
  getReversibleStatus,
};
