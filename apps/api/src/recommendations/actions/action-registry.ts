/*
 * LICENSE PLACEHOLDER
 */

import type { McpCapabilityType } from '@edulution/events';

export interface ActionDefinition {
  capability: McpCapabilityType;
  name: string;
  description: string;
  domain: 'files' | 'chat' | 'conference' | 'bulletin' | 'survey' | 'mail' | 'lmn';
  requiredParams: string[];
  optionalParams?: string[];
  reversible: boolean;
  impact: 'low' | 'medium' | 'high';
}

export const ACTION_REGISTRY: Record<string, ActionDefinition> = {
  // ===== FILES =====
  'files.create_folder': {
    capability: 'files.create_folder',
    name: 'Create Folder',
    description: 'Create a new folder',
    domain: 'files',
    requiredParams: ['name', 'path'],
    reversible: true,
    impact: 'low',
  },
  'files.create_file': {
    capability: 'files.create_file',
    name: 'Create File',
    description: 'Create a new file with content',
    domain: 'files',
    requiredParams: ['name', 'path', 'content'],
    reversible: true,
    impact: 'low',
  },
  'files.copy_file': {
    capability: 'files.copy_file',
    name: 'Copy File',
    description: 'Copy a file to another location',
    domain: 'files',
    requiredParams: ['source_path', 'destination_path'],
    reversible: true,
    impact: 'low',
  },
  'files.move_file': {
    capability: 'files.move_file',
    name: 'Move File',
    description: 'Move a file to another location',
    domain: 'files',
    requiredParams: ['source_path', 'destination_path'],
    reversible: true,
    impact: 'low',
  },
  'files.rename_file': {
    capability: 'files.rename_file',
    name: 'Rename File',
    description: 'Rename a file or folder',
    domain: 'files',
    requiredParams: ['path', 'new_name'],
    reversible: true,
    impact: 'low',
  },
  'files.delete_file': {
    capability: 'files.delete_file',
    name: 'Delete File',
    description: 'Delete a file or folder',
    domain: 'files',
    requiredParams: ['path'],
    reversible: false,
    impact: 'high',
  },
  'files.public_share_create': {
    capability: 'files.public_share_create',
    name: 'Create Public Share',
    description: 'Create a public share link',
    domain: 'files',
    requiredParams: ['path'],
    optionalParams: ['expires_at', 'password'],
    reversible: true,
    impact: 'medium',
  },

  // ===== CHAT =====
  'chat.group_create': {
    capability: 'chat.group_create',
    name: 'Create Group Chat',
    description: 'Create a new group chat',
    domain: 'chat',
    requiredParams: ['name'],
    optionalParams: ['members'],
    reversible: true,
    impact: 'low',
  },
  'chat.user_create': {
    capability: 'chat.user_create',
    name: 'Start Direct Message',
    description: 'Start a direct message conversation',
    domain: 'chat',
    requiredParams: ['user_id'],
    reversible: true,
    impact: 'low',
  },
  'chat.send_message': {
    capability: 'chat.send_message',
    name: 'Send Message',
    description: 'Send a message to a chat',
    domain: 'chat',
    requiredParams: ['chat_id', 'message'],
    reversible: false,
    impact: 'medium',
  },

  // ===== CONFERENCE =====
  'conference.create': {
    capability: 'conference.create',
    name: 'Create Conference',
    description: 'Create a new video conference',
    domain: 'conference',
    requiredParams: ['name'],
    optionalParams: ['scheduled_at', 'participants'],
    reversible: true,
    impact: 'low',
  },
  'conference.start': {
    capability: 'conference.start',
    name: 'Start Conference',
    description: 'Start an existing conference',
    domain: 'conference',
    requiredParams: ['conference_id'],
    reversible: true,
    impact: 'medium',
  },
  'conference.join': {
    capability: 'conference.join',
    name: 'Join Conference',
    description: 'Join an existing conference',
    domain: 'conference',
    requiredParams: ['conference_id'],
    reversible: true,
    impact: 'low',
  },

  // ===== BULLETIN =====
  'bulletin.create': {
    capability: 'bulletin.create',
    name: 'Create Bulletin',
    description: 'Create a new bulletin announcement',
    domain: 'bulletin',
    requiredParams: ['title', 'content', 'category_id'],
    optionalParams: ['target_groups'],
    reversible: true,
    impact: 'medium',
  },
  'bulletin.update': {
    capability: 'bulletin.update',
    name: 'Update Bulletin',
    description: 'Update an existing bulletin',
    domain: 'bulletin',
    requiredParams: ['bulletin_id'],
    optionalParams: ['title', 'content'],
    reversible: true,
    impact: 'low',
  },

  // ===== SURVEY =====
  'survey.create': {
    capability: 'survey.create',
    name: 'Create Survey',
    description: 'Create a new survey',
    domain: 'survey',
    requiredParams: ['title', 'questions'],
    reversible: true,
    impact: 'medium',
  },

  // ===== MAIL =====
  'mail.sync_job_create': {
    capability: 'mail.sync_job_create',
    name: 'Create Mail Sync Job',
    description: 'Create a job to sync mail from external source',
    domain: 'mail',
    requiredParams: ['source_config'],
    optionalParams: ['schedule'],
    reversible: true,
    impact: 'medium',
  },

  // ===== LMN =====
  'lmn.start_exam': {
    capability: 'lmn.start_exam',
    name: 'Start Exam Mode',
    description: 'Start exam mode for students',
    domain: 'lmn',
    requiredParams: ['users'],
    reversible: true,
    impact: 'high',
  },
  'lmn.stop_exam': {
    capability: 'lmn.stop_exam',
    name: 'Stop Exam Mode',
    description: 'Stop exam mode for students',
    domain: 'lmn',
    requiredParams: ['users'],
    reversible: false,
    impact: 'high',
  },
  'lmn.toggle_project': {
    capability: 'lmn.toggle_project',
    name: 'Toggle Project',
    description: 'Add or remove users from a project',
    domain: 'lmn',
    requiredParams: ['project_name', 'users', 'action'],
    reversible: true,
    impact: 'medium',
  },
  'lmn.add_management_group': {
    capability: 'lmn.add_management_group',
    name: 'Add to Management Group',
    description: 'Add users to a management group',
    domain: 'lmn',
    requiredParams: ['group_name', 'users'],
    reversible: true,
    impact: 'medium',
  },
};

// ===== HELPER FUNCTIONS =====

export function getActionDefinition(capability: string): ActionDefinition | undefined {
  return ACTION_REGISTRY[capability];
}

export function getActionsByDomain(domain: string): ActionDefinition[] {
  return Object.values(ACTION_REGISTRY).filter((a) => a.domain === domain);
}

export function isReversible(capability: string): boolean {
  return ACTION_REGISTRY[capability]?.reversible ?? false;
}

export function getImpact(capability: string): 'low' | 'medium' | 'high' {
  return ACTION_REGISTRY[capability]?.impact ?? 'medium';
}

export function validateParams(
  capability: string,
  params: Record<string, unknown>,
): {
  valid: boolean;
  missing: string[];
} {
  const def = ACTION_REGISTRY[capability];
  if (!def) return { valid: false, missing: [] };

  const missing = def.requiredParams.filter((p) => !(p in params));
  return { valid: missing.length === 0, missing };
}
