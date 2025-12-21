#!/usr/bin/env node
/*
 * LICENSE PLACEHOLDER
 */

import Redis from 'ioredis';
import {
  EventPublisher,
  EVENT_SOURCES,
  CONSUMER_GROUPS,
  buildUserCounts24hKey,
  buildUserLastSeenKey,
  TTL_CONFIG,
} from "@edulution/events/src/index.js";
import type { Event, EventSource } from "@edulution/events/src/index.js";
import DemoDataGenerator from './demo-data-generator.js';

interface CliOptions {
  host: string;
  port: number;
  users: string[];
  threads: number;
  channels: number;
  calendarEvents: number;
  fileOperations: number;
  timeRange: number;
  enableScenarios: boolean;
  dryRun: boolean;
  verbose: boolean;
}

const DEFAULT_OPTIONS: CliOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  users: ['demo-user-1', 'demo-user-2', 'demo-user-3'],
  threads: 5,
  channels: 3,
  calendarEvents: 5,
  fileOperations: 5,
  timeRange: 48,
  enableScenarios: true,
  dryRun: false,
  verbose: false,
};

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--host':
        options.host = args[++i];
        break;
      case '--port':
        options.port = parseInt(args[++i], 10);
        break;
      case '--users':
        options.users = args[++i].split(',');
        break;
      case '--threads':
        options.threads = parseInt(args[++i], 10);
        break;
      case '--channels':
        options.channels = parseInt(args[++i], 10);
        break;
      case '--calendar-events':
        options.calendarEvents = parseInt(args[++i], 10);
        break;
      case '--files':
        options.fileOperations = parseInt(args[++i], 10);
        break;
      case '--time-range':
        options.timeRange = parseInt(args[++i], 10);
        break;
      case '--no-scenarios':
        options.enableScenarios = false;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Demo Data Loader for Event Logging System

Usage: npx tsx load-demo-data.ts [options]

Options:
  --host <host>           Redis host (default: localhost)
  --port <port>           Redis port (default: 6379)
  --users <users>         Comma-separated user IDs (default: demo-user-1,demo-user-2,demo-user-3)
  --threads <count>       Number of mail threads (default: 5)
  --channels <count>      Number of chat channels (default: 3)
  --calendar-events <n>   Calendar events per user (default: 5)
  --files <count>         File operations per user (default: 5)
  --time-range <hours>    Time range in hours (default: 48)
  --no-scenarios          Disable coherent test scenarios
  --dry-run               Generate but don't publish events
  --verbose, -v           Show detailed output
  --help, -h              Show this help

Examples:
  npx tsx apps/api/src/events/cli/load-demo-data.ts
  npx tsx apps/api/src/events/cli/load-demo-data.ts --threads 10 --files 10 --verbose
  npx tsx apps/api/src/events/cli/load-demo-data.ts --no-scenarios --dry-run
`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log('='.repeat(60));
  console.log('Event Logging System - Demo Data Loader');
  console.log('='.repeat(60));
  console.log('');

  console.log('Configuration:');
  console.log(`  Redis: ${options.host}:${options.port}`);
  console.log(`  Users: ${options.users.join(', ')}`);
  console.log(`  Mail threads: ${options.threads}`);
  console.log(`  Chat channels: ${options.channels}`);
  console.log(`  Calendar events per user: ${options.calendarEvents}`);
  console.log(`  File operations per user: ${options.fileOperations}`);
  console.log(`  Time range: ${options.timeRange} hours`);
  console.log(`  Coherent scenarios: ${options.enableScenarios ? 'enabled' : 'disabled'}`);
  console.log(`  Dry run: ${options.dryRun}`);
  console.log('');

  const generator = new DemoDataGenerator({
    userIds: options.users,
    threadCount: options.threads,
    messagesPerThread: 4,
    chatChannels: options.channels,
    messagesPerChannel: 10,
    calendarEventsPerUser: options.calendarEvents,
    fileOperationsPerUser: options.fileOperations,
    timeRangeHours: options.timeRange,
    enableScenarios: options.enableScenarios,
  });

  console.log('Generating demo events...');
  const events = generator.generateAll();
  const summary = DemoDataGenerator.generateSummary(events);

  console.log('');
  console.log('Generated Events Summary:');
  console.log(`  Total: ${summary.total}`);
  console.log('  By Source:');
  for (const [source, count] of Object.entries(summary.bySource)) {
    console.log(`    ${source}: ${count}`);
  }
  console.log('  By Type:');
  for (const [type, count] of Object.entries(summary.byType)) {
    console.log(`    ${type}: ${count}`);
  }
  console.log(`  Time Range: ${summary.timeRange.earliest} to ${summary.timeRange.latest}`);
  if (summary.scenarios.length > 0) {
    console.log(`  Scenarios: ${summary.scenarios.length}`);
    for (const scenarioId of summary.scenarios) {
      console.log(`    - ${scenarioId}`);
    }
  }
  console.log('');

  if (options.verbose) {
    console.log('Sample Events (first 3):');
    for (const event of events.slice(0, 3)) {
      console.log(JSON.stringify(event, null, 2));
      console.log('---');
    }
    console.log('');
  }

  if (options.dryRun) {
    console.log('Dry run mode - events not published');
    console.log('');
    console.log('Done!');
    return;
  }

  console.log(`Connecting to Redis at ${options.host}:${options.port}...`);

  const publisher = new EventPublisher({
    host: options.host,
    port: options.port,
  });

  try {
    await publisher.connect();
    console.log('Connected to Redis');

    console.log('Creating consumer groups...');
    const sources = Object.values(EVENT_SOURCES);
    for (const source of sources) {
      try {
        await publisher.createConsumerGroup(source, CONSUMER_GROUPS.AGGREGATORS);
        if (options.verbose) {
          console.log(`  Created group for ${source}`);
        }
      } catch {
        // Group may already exist
      }
    }

    console.log('');
    console.log('Publishing events...');

    let published = 0;
    let deduplicated = 0;
    let failed = 0;

    const batchSize = 50;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      const results = await publisher.publishBatch(batch);

      for (const result of results) {
        if (result.success) {
          if (result.deduplicated) {
            deduplicated++;
          } else {
            published++;
          }
        } else {
          failed++;
          if (options.verbose) {
            console.error(`  Failed: ${result.eventId} - ${result.error?.message}`);
          }
        }
      }

      const progress = Math.min(i + batchSize, events.length);
      process.stdout.write(`\r  Progress: ${progress}/${events.length}`);
    }

    console.log('');
    console.log('');
    console.log('Results:');
    console.log(`  Published: ${published}`);
    console.log(`  Deduplicated: ${deduplicated}`);
    console.log(`  Failed: ${failed}`);
    console.log('');

    console.log('Updating state keys for Summary API...');
    const stateRedis = new Redis({
      host: options.host,
      port: options.port,
      maxRetriesPerRequest: 3,
    });

    try {
      const stateResult = await updateStateKeys(stateRedis, events, options.verbose);
      console.log(`  Users updated: ${stateResult.usersUpdated}`);
      console.log(`  Count entries: ${stateResult.countsUpdated}`);
      console.log('');
    } finally {
      await stateRedis.quit();
    }

    await publisher.disconnect();
    console.log('Disconnected from Redis');
    console.log('');
    console.log('Done!');

  } catch (error) {
    console.error('Error:', (error as Error).message);
    await publisher.disconnect();
    process.exit(1);
  }
}

async function updateStateKeys(
  redis: Redis,
  events: Event[],
  verbose: boolean,
): Promise<{ usersUpdated: number; countsUpdated: number }> {
  const userCounts: Record<string, Record<string, number>> = {};
  const userLastSeen: Record<string, Record<string, string>> = {};

  for (const event of events) {
    const userId = event.user_id;
    const eventType = event.type;
    const {source} = event;
    const occurredAt = event.occurred_at;

    if (!userCounts[userId]) {
      userCounts[userId] = {};
    }
    userCounts[userId][eventType] = (userCounts[userId][eventType] || 0) + 1;

    if (!userLastSeen[userId]) {
      userLastSeen[userId] = {};
    }
    const currentLastSeen = userLastSeen[userId][source];
    if (!currentLastSeen || occurredAt > currentLastSeen) {
      userLastSeen[userId][source] = occurredAt;
    }
  }

  const pipeline = redis.pipeline();
  let countsUpdated = 0;

  for (const userId of Object.keys(userCounts)) {
    const counts24hKey = buildUserCounts24hKey(userId);
    const lastSeenKey = buildUserLastSeenKey(userId);

    for (const [eventType, count] of Object.entries(userCounts[userId])) {
      pipeline.hincrby(counts24hKey, eventType, count);
      countsUpdated++;
    }
    pipeline.expire(counts24hKey, TTL_CONFIG.COUNTS_24H_TTL_SECONDS);

    for (const [source, timestamp] of Object.entries(userLastSeen[userId])) {
      pipeline.hset(lastSeenKey, source, timestamp);
    }
    pipeline.expire(lastSeenKey, TTL_CONFIG.SIGNALS_TTL_SECONDS);
  }

  await pipeline.exec();

  if (verbose) {
    console.log('  State keys updated for users:', Object.keys(userCounts).join(', '));
  }

  return {
    usersUpdated: Object.keys(userCounts).length,
    countsUpdated,
  };
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
