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

function generateRandomString(length: number) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + (Math.random() < 0.5 ? numbers : specialChars);

  const getRandomChar = (charSet: string) => charSet[Math.floor(Math.random() * charSet.length)];

  const randomChars = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(Math.random() < 0.5 ? numbers : specialChars),
  ];

  while (randomChars.length < length) {
    randomChars.push(getRandomChar(allChars));
  }

  for (let i = randomChars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomChars[i], randomChars[j]] = [randomChars[j], randomChars[i]];
  }

  return randomChars.join('');
}

export default generateRandomString;
