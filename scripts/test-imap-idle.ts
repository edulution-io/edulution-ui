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

/* eslint-disable no-console */
import { ImapFlow } from 'imapflow';

const EMAIL = process.env.EMAIL || 'user@example.com';
const PASSWORD = process.env.PASSWORD || 'password';
const HOST = process.env.HOST || 'localhost';
const PORT = parseInt(process.env.PORT || '143', 10);

async function testImapIdle() {
  console.log(`Connecting to ${HOST}:${PORT} as ${EMAIL}...`);

  const client = new ImapFlow({
    host: HOST,
    port: PORT,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    logger: {
      debug: (msg) => console.log('[DEBUG]', msg),
      info: (msg) => console.log('[INFO]', msg),
      warn: (msg) => console.log('[WARN]', msg),
      error: (msg) => console.log('[ERROR]', msg),
    },
  });

  client.on('error', (err) => {
    console.error('IMAP Error:', err.message);
  });

  client.on('close', () => {
    console.log('Connection closed');
  });

  client.on('exists', (data) => {
    console.log('📬 EXISTS Event:', data);
    console.log(`   New mail count: ${data.count}, Previous: ${data.prevCount}`);
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully');

    const mailbox = await client.mailboxOpen('INBOX');
    console.log(`📥 INBOX opened: ${mailbox.exists} messages`);

    console.log('\n🔄 Starting IDLE mode... (waiting for new mail)');
    console.log('   Send an email to this account to test.');
    console.log('   Press Ctrl+C to exit.\n');

    process.on('SIGINT', async () => {
      console.log('\nStopping...');
      await client.logout();
      process.exit(0);
    });

    // Keep the connection alive
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testImapIdle();

// To run this script, ensure you have 'imapflow' installed:
// npm install imapflow
//
// Then execute the script with Node.js, providing necessary environment variables if needed:
// EMAIL, PASSWORD, HOST, and PORT.
// Example:
//  EMAIL="user@mail.de" PASSWORD='password' HOST="localhost" PORT="143" npx tsx test-imap-idle.ts
