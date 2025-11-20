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

import toArrayBuffer from '@libs/common/utils/toArrayBuffer';
import EncryptedPasswordObject from '../types/encryptPasswordObject';

export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
    'deriveKey',
  ]);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

export const encryptPassword = async (
  password: string,
  key: CryptoKey,
): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(password));
  return { iv, ciphertext };
};

export const decryptPassword = async (encryptedData: EncryptedPasswordObject, safePin: string): Promise<string> => {
  try {
    const key = await deriveKey(safePin, new Uint8Array(encryptedData.salt));
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(encryptedData.iv),
      },
      key,
      new Uint8Array(encryptedData.ciphertext),
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    return '';
  }
};
