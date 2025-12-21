#!/usr/bin/env npx tsx
/*
 * LICENSE PLACEHOLDER
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import TimelineGenerator, { type GeneratedTimeline, type ScenarioType } from './timeline-generator';

const TIMELINES_DIR = join(__dirname, 'timelines');

interface TimelineSpec {
  id: string;
  name: string;
  description: string;
  scenario: ScenarioType;
}

const TIMELINE_SPECS: TimelineSpec[] = [
  {
    id: 'tl_001_low_activity',
    name: 'Low Activity Day',
    description: 'Minimal events, should trigger focus/cleanup recommendations',
    scenario: 'low_activity',
  },
  {
    id: 'tl_002_busy_meeting',
    name: 'Busy Meeting Day',
    description: '5+ meetings, should trigger meeting/planning recommendations',
    scenario: 'busy_meeting',
  },
  {
    id: 'tl_003_communication',
    name: 'Communication Heavy Day',
    description: 'Many messages, threads awaiting reply',
    scenario: 'communication_heavy',
  },
  {
    id: 'tl_004_mixed',
    name: 'Mixed Activity Day',
    description: 'Meetings + emails + chat with correlations',
    scenario: 'mixed',
  },
  {
    id: 'tl_005_noisy',
    name: 'Noisy Day',
    description: 'Many event types, tests recommendation precision',
    scenario: 'noisy',
  },
  {
    id: 'tl_006_teacher_day',
    name: 'Teacher Day',
    description: 'Teacher with bulletin, surveys, conferences, whiteboard',
    scenario: 'teacher_day',
  },
  {
    id: 'tl_007_student_day',
    name: 'Student Day',
    description: 'Student with surveys, chat, whiteboard',
    scenario: 'student_day',
  },
  {
    id: 'tl_008_collaboration',
    name: 'Collaboration Day',
    description: 'Heavy chat, whiteboard, file sharing',
    scenario: 'collaboration',
  },
];

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function generateAllTimelines(): GeneratedTimeline[] {
  const generator = new TimelineGenerator();
  const baseDate = new Date('2025-12-20T00:00:00.000Z');
  const timelines: GeneratedTimeline[] = [];

  TIMELINE_SPECS.forEach((spec, index) => {
    const timeline = generator.generate({
      id: spec.id,
      name: spec.name,
      description: spec.description,
      userId: `eval-user-${index + 1}`,
      scenario: spec.scenario,
      baseTime: baseDate,
      durationHours: 10,
    });

    timelines.push(timeline);
  });

  return timelines;
}

function saveTimelines(timelines: GeneratedTimeline[]): void {
  ensureDir(TIMELINES_DIR);

  timelines.forEach((timeline) => {
    const filePath = join(TIMELINES_DIR, `${timeline.timeline_id}.json`);
    writeFileSync(filePath, JSON.stringify(timeline, null, 2));
    console.log(`  Created: ${filePath}`);
  });
}

function printSummary(timelines: GeneratedTimeline[]): void {
  console.log('');
  console.log('Timeline Summary:');
  console.log('='.repeat(70));

  timelines.forEach((tl) => {
    console.log(`\n${tl.name} (${tl.timeline_id})`);
    console.log(`  Scenario: ${tl.scenario}`);
    console.log(`  Events: ${tl.events.length}`);
    console.log(`  Checkpoints: ${tl.checkpoints.length}`);
    console.log(`  Expected Labels:`);
    tl.expected_labels.forEach((label) => {
      console.log(`    - [${label.class}] ${label.rule_id}`);
    });
  });

  console.log('');
  console.log('='.repeat(70));
  console.log(`Total: ${timelines.length} timelines generated`);
}

async function main(): Promise<void> {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Timeline Generator - Evaluation Framework            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  console.log('Generating timelines...');
  const timelines = generateAllTimelines();

  console.log('');
  console.log('Saving to files...');
  saveTimelines(timelines);

  printSummary(timelines);

  console.log('');
  console.log('Done!');
}

main().catch(console.error);
