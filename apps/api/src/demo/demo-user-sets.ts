/*
 * LICENSE PLACEHOLDER
 */

type DemoScenario =
  | 'busy_day'
  | 'light_day'
  | 'communication'
  | 'focus_day'
  | 'teacher_day'
  | 'mixed'
  | 'cross_app_full'
  | 'cross_app_teacher'
  | 'cross_app_admin'
  | 'conference_heavy'
  | 'exam_day'
  | 'files_heavy';

interface UserScenarioConfig {
  userId: string;
  scenario: DemoScenario;
  eventCount?: number;
}

const DEMO_USER_SETS: Record<string, UserScenarioConfig[]> = {
  brs: [
    { userId: 'brs-netzint-teacher', scenario: 'teacher_day', eventCount: 40 },
    { userId: 'brs-netzint1', scenario: 'busy_day', eventCount: 50 },
    { userId: 'brs-netzint2', scenario: 'light_day', eventCount: 10 },
    { userId: 'brs-netzint3', scenario: 'communication', eventCount: 45 },
    { userId: 'brs-netzint4', scenario: 'focus_day', eventCount: 15 },
    { userId: 'brs-netzint5', scenario: 'mixed', eventCount: 25 },
  ],
  students_busy: [
    { userId: 'brs-netzint1', scenario: 'busy_day' },
    { userId: 'brs-netzint2', scenario: 'busy_day' },
    { userId: 'brs-netzint3', scenario: 'busy_day' },
    { userId: 'brs-netzint4', scenario: 'busy_day' },
    { userId: 'brs-netzint5', scenario: 'busy_day' },
  ],
  all_light: [
    { userId: 'brs-netzint-teacher', scenario: 'light_day' },
    { userId: 'brs-netzint1', scenario: 'light_day' },
    { userId: 'brs-netzint2', scenario: 'light_day' },
    { userId: 'brs-netzint3', scenario: 'light_day' },
    { userId: 'brs-netzint4', scenario: 'light_day' },
    { userId: 'brs-netzint5', scenario: 'light_day' },
  ],
};

type DemoUserSet = keyof typeof DEMO_USER_SETS;

export default DEMO_USER_SETS;
export type { DemoScenario, DemoUserSet, UserScenarioConfig };
