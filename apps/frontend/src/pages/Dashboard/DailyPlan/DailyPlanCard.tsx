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

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Calendar, CheckCircle2, ChevronRight, Play, RefreshCw, Sun, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import useDailyPlanStore from '@/store/useDailyPlanStore';
import useUserStore from '@/store/UserStore/useUserStore';
import cn from '@libs/common/utils/className';
import type { ActionProposal } from '@libs/ai/types/dailyPlan';

const TIME_WINDOW_ICONS: Record<string, string> = {
  morning: 'text-amber-500',
  midday: 'text-yellow-500',
  afternoon: 'text-orange-500',
  evening: 'text-indigo-500',
};

interface ActionProposalDisplayProps {
  actionProposal: ActionProposal;
  candidateId: string;
  t: (key: string) => string;
  onExecute: (candidateId: string) => void;
  isExecuting: boolean;
}

const ActionProposalDisplay = ({ actionProposal, candidateId, t, onExecute, isExecuting }: ActionProposalDisplayProps) => (
  <div className="ml-9 mt-2 rounded-md bg-muted/40 p-2">
    <div className="mb-1 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Zap className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          {t('dailyPlan.actions')} ({actionProposal.steps.length} {t('dailyPlan.steps')}):
        </span>
      </div>
      <Button
        variant="btn-ghost"
        size="sm"
        className="h-6 gap-1 px-2"
        onClick={() => onExecute(candidateId)}
        disabled={isExecuting}
        title={t('dailyPlan.executeAction')}
      >
        <Play className={cn('h-3 w-3', isExecuting && 'animate-pulse')} />
        <span className="text-xs">{isExecuting ? t('dailyPlan.executing') : t('dailyPlan.executeAction')}</span>
      </Button>
    </div>
    <ul className="space-y-1">
      {actionProposal.steps.slice(0, 3).map((step) => (
        <li
          key={step.step_id}
          className="flex items-center gap-2 text-xs"
        >
          <ChevronRight className="h-3 w-3 flex-shrink-0 text-primary" />
          <span className="flex-1">{step.description}</span>
          <code className="rounded bg-muted px-1 text-[10px] text-muted-foreground">{step.capability}</code>
        </li>
      ))}
      {actionProposal.steps.length > 3 && (
        <li className="text-xs text-muted-foreground">
          +{actionProposal.steps.length - 3} {t('dailyPlan.moreSteps')}
        </li>
      )}
    </ul>
  </div>
);

const DailyPlanCard = () => {
  const { t } = useTranslation();
  const { dailyPlan, isLoading, error, fetchDailyPlan, executeAction, executingCandidateId } = useDailyPlanStore();
  const { user } = useUserStore();

  useEffect(() => {
    void fetchDailyPlan();
  }, [fetchDailyPlan]);

  const handleRefresh = useCallback(() => {
    void fetchDailyPlan({ refresh: true });
  }, [fetchDailyPlan]);

  const handleExecuteAction = useCallback(
    async (candidateId: string) => {
      if (!user?.username) {
        toast.error(t('dailyPlan.actionFailed'));
        return;
      }

      const result = await executeAction(user.username, candidateId);

      if (result) {
        if (result.success) {
          toast.success(t('dailyPlan.actionSuccess'));
        } else {
          toast.error(
            `${t('dailyPlan.actionFailed')}: ${result.failed_steps} ${t('dailyPlan.stepsFailed')}`,
          );
        }
      }
    },
    [executeAction, user?.username, t],
  );

  if (isLoading && !dailyPlan) {
    return (
      <Card
        variant="collaboration"
        className="flex max-h-[400px] flex-col"
      >
        <CardContent className="max-h-[350px] overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">{t('dailyPlan.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !dailyPlan) {
    return (
      <Card
        variant="collaboration"
        className="min-h-[280px] overflow-y-auto scrollbar-thin md:min-h-[100%]"
      >
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-destructive">{t('dailyPlan.error')}</p>
            <Button
              variant="btn-outline"
              size="sm"
              className="mt-4"
              onClick={handleRefresh}
            >
              {t('dailyPlan.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyPlan) {
    return null;
  }

  return (
    <Card
      variant="collaboration"
      className="flex max-h-[400px] flex-col"
    >
      <CardContent className="flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold">{dailyPlan.plan_title}</h3>
          </div>
          <Button
            variant="btn-ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        {dailyPlan.priorities.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">{t('dailyPlan.priorities')}</h4>
            <ul className="space-y-3">
              {dailyPlan.priorities.slice(0, 3).map((priority) => (
                <li
                  key={priority.rank}
                  className="flex flex-col"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {priority.rank}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{priority.title}</p>
                      <p className="text-xs text-muted-foreground">{priority.why}</p>
                    </div>
                  </div>
                  {priority.action_proposal && priority.linked_candidate_ids?.[0] && (
                    <ActionProposalDisplay
                      actionProposal={priority.action_proposal}
                      candidateId={priority.linked_candidate_ids[0]}
                      t={t}
                      onExecute={handleExecuteAction}
                      isExecuting={executingCandidateId === priority.linked_candidate_ids[0]}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {dailyPlan.schedule_suggestion.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">{t('dailyPlan.schedule')}</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {dailyPlan.schedule_suggestion.map((slot) => (
                <div
                  key={slot.time_window}
                  className="rounded-lg border border-border p-2"
                >
                  <div className="flex items-center gap-1">
                    <Calendar className={cn('h-3 w-3', TIME_WINDOW_ICONS[slot.time_window] || 'text-gray-500')} />
                    <span className="text-xs font-medium capitalize">
                      {t(`dailyPlan.timeWindows.${slot.time_window}`)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{slot.focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {dailyPlan.recap && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              <p className="text-xs italic text-muted-foreground">{dailyPlan.recap}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyPlanCard;
