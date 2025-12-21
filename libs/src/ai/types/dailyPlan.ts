/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

interface ActionStep {
  step_id: string;
  capability: string;
  description: string;
  params?: Record<string, unknown>;
  depends_on?: string[];
  optional?: boolean;
}

interface ActionProposal {
  proposal_id: string;
  title: string;
  description?: string;
  steps: ActionStep[];
  requires_approval?: boolean;
  estimated_impact?: 'low' | 'medium' | 'high';
  reversible?: 'full' | 'partial' | 'none';
  risk?: 'low' | 'medium' | 'high';
}

interface PriorityItem {
  rank: number;
  title: string;
  why: string;
  linked_candidate_ids: string[];
  action_proposal?: ActionProposal;
}

interface ScheduleItem {
  time_window: 'morning' | 'midday' | 'afternoon' | 'evening';
  focus: string;
  items: string[];
}

interface DailyPlan {
  user_id: string;
  date: string;
  plan_title: string;
  priorities: PriorityItem[];
  schedule_suggestion: ScheduleItem[];
  recap: string;
  notes: string[];
  generated_at: string;
}

interface DailyPlanResponse {
  plan: DailyPlan;
  cached: boolean;
  duration_ms: number;
  source: 'redis' | 'mongo' | 'generated';
  input_hash: string;
}

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

export type {
  DailyPlan,
  DailyPlanResponse,
  PriorityItem,
  ScheduleItem,
  ActionStep,
  ActionProposal,
  StepResult,
  ExecutionResult,
};
