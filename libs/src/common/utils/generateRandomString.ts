/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
