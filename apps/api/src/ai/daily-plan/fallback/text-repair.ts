/*
 * LICENSE PLACEHOLDER
 */

import type { AiDailyPlan } from '../schemas/daily-plan.schema';

const ACTIVITY_REPLACEMENTS: Record<string, string> = {
  'low activity': 'a quieter window',
  'Low activity': 'A quieter window',
  'LOW ACTIVITY': 'A QUIETER WINDOW',
  'high activity': 'increased activity',
  'High activity': 'Increased activity',
  'HIGH ACTIVITY': 'INCREASED ACTIVITY',
  'medium activity': 'moderate activity levels',
  'Medium activity': 'Moderate activity levels',
  'MEDIUM ACTIVITY': 'MODERATE ACTIVITY LEVELS',
  'a busy day': 'a full schedule',
  'A busy day': 'A full schedule',
  'busy day': 'a full schedule',
  'Busy day': 'A full schedule',
  'a busy period': 'a demanding period',
  'A busy period': 'A demanding period',
  'busy period': 'a demanding period',
  'Busy period': 'A demanding period',
  'a busy schedule': 'a full schedule',
  'A busy schedule': 'A full schedule',
  'busy schedule': 'a full schedule',
  'Busy schedule': 'A full schedule',
  'a quiet day': 'available time',
  'A quiet day': 'Available time',
  'quiet day': 'available time',
  'Quiet day': 'Available time',
  'a quiet period': 'a calmer period',
  'A quiet period': 'A calmer period',
  'quiet period': 'a calmer period',
  'Quiet period': 'A calmer period',
  'a quiet window': 'an open window',
  'A quiet window': 'An open window',
  'quiet window': 'an open window',
  'Quiet window': 'An open window',
};

function repairActivityClaims(text: string): string {
  let result = text;
  Object.entries(ACTIVITY_REPLACEMENTS).forEach(([pattern, replacement]) => {
    result = result.replace(new RegExp(pattern, 'g'), replacement);
  });
  return result;
}

function repairPlanActivityClaims(plan: AiDailyPlan): AiDailyPlan {
  return {
    ...plan,
    plan_title: repairActivityClaims(plan.plan_title),
    recap: repairActivityClaims(plan.recap),
    priorities: plan.priorities.map((p) => ({
      ...p,
      title: repairActivityClaims(p.title),
      why: repairActivityClaims(p.why),
    })),
    schedule_suggestion: plan.schedule_suggestion.map((s) => ({
      ...s,
      focus: repairActivityClaims(s.focus),
      items: s.items.map((item) => repairActivityClaims(item)),
    })),
  };
}

export { repairActivityClaims, repairPlanActivityClaims, ACTIVITY_REPLACEMENTS };
