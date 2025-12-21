/*
 * LICENSE PLACEHOLDER
 */

import type { AiDailyPlan } from '../schemas/daily-plan.schema';

interface ValidationResult {
  valid: boolean;
  violations: string[];
}

function containsNumerals(text: string): boolean {
  return /[0-9]/.test(text);
}

function validateNoNumerals(plan: AiDailyPlan): ValidationResult {
  const violations: string[] = [];

  const checkField = (value: string, fieldName: string) => {
    if (containsNumerals(value)) {
      violations.push(`Field "${fieldName}" contains numerals: "${value.substring(0, 50)}..."`);
    }
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

  plan.notes.forEach((note, i) => {
    checkField(note, `notes[${i}]`);
  });

  return { valid: violations.length === 0, violations };
}

export { containsNumerals, validateNoNumerals };
export type { ValidationResult };
