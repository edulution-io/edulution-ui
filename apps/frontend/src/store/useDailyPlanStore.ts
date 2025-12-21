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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { AI_ENDPOINT, AI_DAILY_PLAN_TODAY_ENDPOINT, RECOMMENDATIONS_ENDPOINT } from '@libs/ai/constants/aiEndpoints';
import type { DailyPlan, DailyPlanResponse, ExecutionResult } from '@libs/ai/types/dailyPlan';
import handleApiError from '@/utils/handleApiError';

type DailyPlanStore = {
  dailyPlan: DailyPlan | null;
  isLoading: boolean;
  error: Error | null;
  cached: boolean;
  source: 'redis' | 'mongo' | 'generated' | null;
  lastFetched: string | null;
  executingCandidateId: string | null;
  lastExecutionResult: ExecutionResult | null;
  fetchDailyPlan: (options?: { refresh?: boolean }) => Promise<DailyPlan | null>;
  executeAction: (userId: string, candidateId: string) => Promise<ExecutionResult | null>;
  reset: () => void;
};

const initialState = {
  dailyPlan: null,
  isLoading: false,
  error: null,
  cached: false,
  source: null as 'redis' | 'mongo' | 'generated' | null,
  lastFetched: null as string | null,
  executingCandidateId: null as string | null,
  lastExecutionResult: null as ExecutionResult | null,
};

const useDailyPlanStore = create<DailyPlanStore>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchDailyPlan: async (options) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = get();

    if (!options?.refresh && existing.dailyPlan && existing.lastFetched === today) {
      return existing.dailyPlan;
    }

    set({ isLoading: true, error: null });

    try {
      const refreshParam = options?.refresh ? '?refresh=true' : '';
      const endpoint = `${AI_ENDPOINT}/${AI_DAILY_PLAN_TODAY_ENDPOINT}${refreshParam}`;
      const response = await eduApi.get<DailyPlanResponse>(endpoint);

      set({
        dailyPlan: response.data.plan,
        cached: response.data.cached,
        source: response.data.source,
        lastFetched: today,
        isLoading: false,
      });

      return response.data.plan;
    } catch (error) {
      handleApiError(error, set, 'error');
      set({ isLoading: false });
      return null;
    }
  },

  executeAction: async (userId, candidateId) => {
    set({ executingCandidateId: candidateId, error: null });

    try {
      const endpoint = `${RECOMMENDATIONS_ENDPOINT}/${userId}/${candidateId}/execute`;
      const response = await eduApi.post<ExecutionResult>(endpoint);

      set({
        executingCandidateId: null,
        lastExecutionResult: response.data,
      });

      return response.data;
    } catch (error) {
      handleApiError(error, set, 'error');
      set({ executingCandidateId: null });
      return null;
    }
  },
}));

export default useDailyPlanStore;
