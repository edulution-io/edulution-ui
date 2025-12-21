/*
 * LICENSE PLACEHOLDER
 */

import type { AiDailyPlan } from '../schemas/daily-plan.schema';
import { validateNoNumerals, type ValidationResult } from './safety.validator';

interface GuardrailResult {
  valid: boolean;
  violations: string[];
  canRepair: boolean;
}

function checkNoNumerals(plan: AiDailyPlan): GuardrailResult {
  const result: ValidationResult = validateNoNumerals(plan);
  return {
    valid: result.valid,
    violations: result.violations,
    canRepair: true,
  };
}

function checkCandidateIdIntegrity(
  plan: AiDailyPlan,
  allowedIds: Set<string>,
): GuardrailResult {
  const violations: string[] = [];

  if (allowedIds.size > 0) {
    plan.priorities.forEach((p, i) => {
      if (!p.linked_candidate_ids || p.linked_candidate_ids.length === 0) {
        violations.push(`priorities[${i}] has empty linked_candidate_ids`);
      } else {
        p.linked_candidate_ids.forEach((id, j) => {
          if (!allowedIds.has(id)) {
            violations.push(`priorities[${i}].linked_candidate_ids[${j}] references unknown ID: ${id}`);
          }
        });
      }
    });
  }

  return {
    valid: violations.length === 0,
    violations,
    canRepair: true,
  };
}

const FORBIDDEN_PATTERNS = [
  /no meeting/i,
  /no meetings/i,
  /zero meeting/i,
  /don't have any meeting/i,
  /no scheduled meeting/i,
];

const FORBIDDEN_TIME_PATTERNS = [
  /\bsoon\b/i,
  /\bshortly\b/i,
  /\bin \d+ (minutes?|hours?)\b/i,
  /\bright now\b/i,
  /\bimmediately\b/i,
  /\bstarting now\b/i,
];

const ALLOWED_TIME_ALTERNATIVES = [
  'later today',
  'upcoming',
  'when ready',
  'at a suitable time',
  'during the day',
];

function checkNoForbiddenClaims(plan: AiDailyPlan): GuardrailResult {
  const violations: string[] = [];

  const checkField = (value: string, path: string) => {
    FORBIDDEN_PATTERNS.forEach((pattern) => {
      if (pattern.test(value)) {
        violations.push(`Forbidden claim in ${path}: matches "${pattern}"`);
      }
    });
  };

  checkField(plan.plan_title, 'plan_title');
  checkField(plan.recap, 'recap');

  plan.priorities.forEach((p, i) => {
    checkField(p.title, `priorities[${i}].title`);
    checkField(p.why, `priorities[${i}].why`);
  });

  plan.schedule_suggestion.forEach((s, i) => {
    checkField(s.focus, `schedule_suggestion[${i}].focus`);
    s.items.forEach((item, j) => {
      checkField(item, `schedule_suggestion[${i}].items[${j}]`);
    });
  });

  return {
    valid: violations.length === 0,
    violations,
    canRepair: true,
  };
}

const ACTIVITY_PATTERNS: Array<{ pattern: RegExp; level: string }> = [
  { pattern: /\blow activity\b/i, level: 'low' },
  { pattern: /\bmedium activity\b/i, level: 'medium' },
  { pattern: /\bhigh activity\b/i, level: 'high' },
  { pattern: /\bquiet(?:er)? (?:day|period|window)\b/i, level: 'low' },
  { pattern: /\bbusy (?:day|period|schedule)\b/i, level: 'high' },
];

function checkActivityLevelClaims(
  plan: AiDailyPlan,
  summaryActivityLevel: string | undefined,
): GuardrailResult {
  const violations: string[] = [];

  const checkField = (value: string, path: string) => {
    ACTIVITY_PATTERNS.forEach(({ pattern, level }) => {
      if (pattern.test(value)) {
        if (!summaryActivityLevel) {
          violations.push(
            `${path} claims "${level} activity" but summary.activity_level is missing`,
          );
        } else if (summaryActivityLevel !== level) {
          violations.push(
            `${path} claims "${level} activity" but summary.activity_level is "${summaryActivityLevel}"`,
          );
        }
      }
    });
  };

  checkField(plan.plan_title, 'plan_title');
  checkField(plan.recap, 'recap');

  plan.priorities.forEach((p, i) => {
    checkField(p.title, `priorities[${i}].title`);
    checkField(p.why, `priorities[${i}].why`);
  });

  plan.schedule_suggestion.forEach((s, i) => {
    checkField(s.focus, `schedule_suggestion[${i}].focus`);
    s.items.forEach((item, j) => {
      checkField(item, `schedule_suggestion[${i}].items[${j}]`);
    });
  });

  return {
    valid: violations.length === 0,
    violations,
    canRepair: true,
  };
}

function checkNoForbiddenTimeClaims(plan: AiDailyPlan): GuardrailResult {
  const violations: string[] = [];

  const checkField = (value: string, path: string) => {
    FORBIDDEN_TIME_PATTERNS.forEach((pattern) => {
      if (pattern.test(value)) {
        violations.push(
          `Forbidden time word in ${path}: matches "${pattern}". ` +
            `Use alternatives like: ${ALLOWED_TIME_ALTERNATIVES.join(', ')}`,
        );
      }
    });
  };

  checkField(plan.plan_title, 'plan_title');
  checkField(plan.recap, 'recap');

  plan.priorities.forEach((p, i) => {
    checkField(p.title, `priorities[${i}].title`);
    checkField(p.why, `priorities[${i}].why`);
  });

  plan.schedule_suggestion.forEach((s, i) => {
    checkField(s.focus, `schedule_suggestion[${i}].focus`);
    s.items.forEach((item, j) => {
      checkField(item, `schedule_suggestion[${i}].items[${j}]`);
    });
  });

  return {
    valid: violations.length === 0,
    violations,
    canRepair: true,
  };
}

function runAllGuardrails(
  plan: AiDailyPlan,
  allowedCandidateIds: Set<string>,
): GuardrailResult {
  const results = [
    checkNoNumerals(plan),
    checkCandidateIdIntegrity(plan, allowedCandidateIds),
    checkNoForbiddenClaims(plan),
    checkNoForbiddenTimeClaims(plan),
  ];

  const allViolations = results.flatMap((r) => r.violations);

  return {
    valid: allViolations.length === 0,
    violations: allViolations,
    canRepair: results.every((r) => r.canRepair),
  };
}

export {
  checkNoNumerals,
  checkCandidateIdIntegrity,
  checkNoForbiddenClaims,
  checkNoForbiddenTimeClaims,
  checkActivityLevelClaims,
  runAllGuardrails,
  ALLOWED_TIME_ALTERNATIVES,
  ACTIVITY_PATTERNS,
};

export type { GuardrailResult };
