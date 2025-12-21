/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import type { ActionStep } from '@edulution/events';
import McpService from '../../mcp/mcp.service';
import McpConfigService from '../../mcp/mcpConfigService';
import UsersService from '../../users/users.service';
import RecommendationsService from '../recommendations.service';
import { getActionDefinition, validateParams } from './action-registry';

interface StepResult {
  step_id: string;
  capability: string;
  success: boolean;
  result?: unknown;
  error?: string;
  skipped?: boolean;
  skip_reason?: string;
}

interface ExecutionResult {
  proposal_id: string;
  candidate_id: string;
  success: boolean;
  steps: StepResult[];
  executed_at: string;
  total_steps: number;
  successful_steps: number;
  failed_steps: number;
  skipped_steps: number;
}

const CAPABILITY_TO_MCP_TOOL: Record<string, string> = {
  'files.create_folder': 'files_create_folder',
  'files.create_file': 'files_create_file',
  'files.copy_file': 'files_copy_file',
  'files.move_file': 'files_move_file',
  'files.rename_file': 'files_rename_file',
  'files.delete_file': 'files_delete_file',
  'files.public_share_create': 'files_public_share_create',
  'chat.group_create': 'chat_create_group',
  'chat.user_create': 'chat_create_user',
  'chat.send_message': 'chat_send_message',
  'conference.create': 'conference_create',
  'conference.start': 'conference_start',
  'conference.join': 'conference_join',
  'bulletin.create': 'bulletin_create',
  'bulletin.update': 'bulletin_update',
  'survey.create': 'survey_create',
  'mail.sync_job_create': 'mail_sync_job_create',
  'lmn.start_exam': 'lmn_start_exam',
  'lmn.stop_exam': 'lmn_stop_exam',
  'lmn.toggle_project': 'lmn_toggle_project',
  'lmn.add_management_group': 'lmn_add_management_group',
};

@Injectable()
class ActionExecutionService {
  private readonly logger = new Logger(ActionExecutionService.name);

  constructor(
    private readonly mcpService: McpService,
    private readonly mcpConfigService: McpConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async executeAction(userId: string, candidateId: string, token?: string): Promise<ExecutionResult> {
    const candidate = await this.recommendationsService.getCandidate(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.user_id !== userId) {
      throw new ForbiddenException('Candidate does not belong to user');
    }

    if (!candidate.action_proposal) {
      throw new NotFoundException('Candidate has no action proposal');
    }

    const actionProposal = candidate.action_proposal;

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userGroups = ActionExecutionService.extractUserGroups(user.ldapGroups);
    const mcpConfigs = await this.mcpConfigService.getByUserAccess(userId, userGroups);

    if (mcpConfigs.length === 0) {
      throw new ForbiddenException('No MCP servers available for user');
    }

    const mcpUrl = mcpConfigs[0].url;

    const stepResults: StepResult[] = [];
    const completedSteps = new Set<string>();

    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const step of actionProposal.steps) {
      const result = await this.executeStep(step, mcpUrl, token, completedSteps);
      stepResults.push(result);

      if (result.success) {
        completedSteps.add(step.step_id);
      } else if (!step.optional) {
        this.logger.warn(`Required step ${step.step_id} failed, stopping execution`);
        break;
      }
    }
    /* eslint-enable no-restricted-syntax, no-await-in-loop */

    const successfulSteps = stepResults.filter((r) => r.success).length;
    const failedSteps = stepResults.filter((r) => !r.success && !r.skipped).length;
    const skippedSteps = stepResults.filter((r) => r.skipped).length;

    return {
      proposal_id: actionProposal.proposal_id,
      candidate_id: candidateId,
      success: failedSteps === 0,
      steps: stepResults,
      executed_at: new Date().toISOString(),
      total_steps: actionProposal.steps.length,
      successful_steps: successfulSteps,
      failed_steps: failedSteps,
      skipped_steps: skippedSteps,
    };
  }

  private async executeStep(
    step: ActionStep,
    mcpUrl: string,
    token: string | undefined,
    completedSteps: Set<string>,
  ): Promise<StepResult> {
    if (step.depends_on && step.depends_on.length > 0) {
      const unmetDependencies = step.depends_on.filter((dep) => !completedSteps.has(dep));
      if (unmetDependencies.length > 0) {
        return {
          step_id: step.step_id,
          capability: step.capability,
          success: false,
          skipped: true,
          skip_reason: `Dependencies not met: ${unmetDependencies.join(', ')}`,
        };
      }
    }

    const actionDef = getActionDefinition(step.capability);
    if (!actionDef) {
      return {
        step_id: step.step_id,
        capability: step.capability,
        success: false,
        error: `Unknown capability: ${step.capability}`,
      };
    }

    const validation = validateParams(step.capability, step.params);
    if (!validation.valid) {
      return {
        step_id: step.step_id,
        capability: step.capability,
        success: false,
        error: `Missing required parameters: ${validation.missing.join(', ')}`,
      };
    }

    const toolName = CAPABILITY_TO_MCP_TOOL[step.capability];
    if (!toolName) {
      return {
        step_id: step.step_id,
        capability: step.capability,
        success: false,
        error: `No MCP tool mapping for capability: ${step.capability}`,
      };
    }

    try {
      this.logger.log(`Executing step ${step.step_id}: ${step.capability}`);
      const result = await this.mcpService.callTool(mcpUrl, toolName, step.params, token);

      if (result.isError) {
        return {
          step_id: step.step_id,
          capability: step.capability,
          success: false,
          error: result.content?.[0]?.text || 'Tool execution failed',
        };
      }

      return {
        step_id: step.step_id,
        capability: step.capability,
        success: true,
        result: result.content,
      };
    } catch (error) {
      this.logger.error(`Step ${step.step_id} failed: ${(error as Error).message}`);
      return {
        step_id: step.step_id,
        capability: step.capability,
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private static extractUserGroups(ldapGroups?: {
    schools?: string[];
    projects?: string[];
    projectPaths?: string[];
    classes?: string[];
    classPaths?: string[];
    roles?: string[];
    others?: string[];
  }): string[] {
    if (!ldapGroups) return [];

    return [
      ...(ldapGroups.schools || []),
      ...(ldapGroups.projects || []),
      ...(ldapGroups.projectPaths || []),
      ...(ldapGroups.classes || []),
      ...(ldapGroups.classPaths || []),
      ...(ldapGroups.roles || []),
      ...(ldapGroups.others || []),
    ];
  }
}

export default ActionExecutionService;
export type { ExecutionResult, StepResult };
