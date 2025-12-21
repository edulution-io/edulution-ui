/*
 * LICENSE PLACEHOLDER
 */

import DEMO_USER_SETS from '../demo-user-sets';
import type { DemoScenario } from '../demo-user-sets';

const SCENARIOS: DemoScenario[] = [
  'busy_day',
  'light_day',
  'communication',
  'focus_day',
  'teacher_day',
  'mixed',
];

function printUsage() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║              Demo Data Generator                          ║
╚══════════════════════════════════════════════════════════╝

Usage: npm run demo:generate -- [options]

Single User Options:
  --user=<userId>      User ID (required for single user mode)
  --scenario=<name>    Scenario type (default: mixed)
  --count=<number>     Override event count
  --date=<YYYY-MM-DD>  Date for events (default: today)

Batch Options:
  --set=<setName>      Generate for predefined user set
  --list-sets          Show available user sets

Available scenarios:
  busy_day      - 50 events: many meetings, emails, chat
  light_day     - 8 events: few activities
  communication - 40 events: heavy mail/chat
  focus_day     - 15 events: deep work
  teacher_day   - 35 events: bulletins, surveys, conferences
  mixed         - 25 events: variety

Examples:
  # Single user
  npm run demo:generate -- --user=brs-netzint-teacher --scenario=teacher_day

  # All BRS users with varied scenarios
  npm run demo:generate -- --set=brs

  # All students busy
  npm run demo:generate -- --set=students_busy

  # Specific date
  npm run demo:generate -- --set=brs --date=2025-12-20
`);
}

function printUserSets() {
  console.log('\nAvailable User Sets:\n');
  for (const [name, configs] of Object.entries(DEMO_USER_SETS)) {
    console.log(`  ${name}:`);
    for (const config of configs) {
      console.log(`    - ${config.userId} (${config.scenario}, ${config.eventCount || 'default'} events)`);
    }
    console.log('');
  }
}

async function runGeneration(
  setName: string | undefined,
  userId: string | undefined,
  scenario: DemoScenario,
  countArg: string | undefined,
  date: Date,
) {
  const { NestFactory } = await import('@nestjs/core');
  const AppModule = (await import('../../app/app.module')).default;
  const DemoDataService = (await import('../demo-data.service')).default;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const demoService = app.get(DemoDataService);

  if (setName) {
    if (!DEMO_USER_SETS[setName]) {
      console.error(`Unknown user set: ${setName}`);
      console.error(`Available: ${Object.keys(DEMO_USER_SETS).join(', ')}`);
      await app.close();
      process.exit(1);
    }

    console.log(`Generating for user set: ${setName}`);
    console.log(`Date: ${date.toISOString().split('T')[0]}`);
    console.log('');

    const result = await demoService.generateForUserSet(setName, date);

    console.log('\n━━━ Results ━━━');
    for (const r of result.results) {
      console.log(`  ✓ ${r.userId}: ${r.eventsCreated} events (${r.scenario})`);
    }
    console.log(`\nTotal: ${result.totalEvents} events`);
  } else if (userId) {
    console.log(`User:     ${userId}`);
    console.log(`Scenario: ${scenario}`);
    console.log(`Date:     ${date.toISOString().split('T')[0]}`);
    console.log(`Count:    ${countArg || 'default for scenario'}`);
    console.log('');
    console.log('Generating events...');

    const result = await demoService.generateDemoData({
      userId,
      scenario,
      eventCount: countArg ? parseInt(countArg, 10) : undefined,
      date,
    });

    console.log('');
    console.log(`✓ Created ${result.eventsCreated} events for ${result.userId}`);
    console.log(`  Date:     ${result.date}`);
    console.log(`  Scenario: ${result.scenario}`);
  }

  console.log('');
  console.log('Next steps:');
  console.log(`  1. Generate recommendations:`);
  console.log(
    `     curl -X POST "http://localhost:3001/edu-api/recommendations/<userId>/generate?force=true" -H "x-events-api-key: dev-events-key"`,
  );
  console.log(`  2. Get daily summary:`);
  console.log(
    `     curl "http://localhost:3001/edu-api/summaries/<userId>/<date>" -H "x-events-api-key: dev-events-key"`,
  );
  console.log(`  3. Generate AI daily plan:`);
  console.log(
    `     curl -X POST "http://localhost:3001/edu-api/ai/daily-plan/<userId>/<date>?configId=YOUR_CONFIG_ID" -H "x-events-api-key: dev-events-key"`,
  );

  await app.close();
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--list-sets')) {
    printUserSets();
    process.exit(0);
  }

  const setName = args.find((a) => a.startsWith('--set='))?.split('=')[1];
  const userId = args.find((a) => a.startsWith('--user='))?.split('=')[1];
  const scenarioArg = args.find((a) => a.startsWith('--scenario='))?.split('=')[1] || 'mixed';
  const countArg = args.find((a) => a.startsWith('--count='))?.split('=')[1];
  const dateStr = args.find((a) => a.startsWith('--date='))?.split('=')[1];

  const scenario: DemoScenario = SCENARIOS.includes(scenarioArg as DemoScenario)
    ? (scenarioArg as DemoScenario)
    : 'mixed';

  const date = dateStr ? new Date(dateStr) : new Date();

  console.log(`
╔══════════════════════════════════════════════════════════╗
║              Demo Data Generator                          ║
╚══════════════════════════════════════════════════════════╝
`);

  if (!setName && !userId) {
    console.error('Error: Either --user or --set must be specified.\n');
    printUsage();
    process.exit(1);
  }

  console.log('Initializing...');

  await runGeneration(setName, userId, scenario, countArg, date);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
