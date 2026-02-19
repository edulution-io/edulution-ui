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

const SOPHOMORIX_STATUS_CLASS_MAP: Record<string, string> = {
  U: 'bg-green-500',
  S: 'bg-green-500',
  E: 'bg-green-500',
  P: 'bg-green-600',
  A: 'bg-yellow-500',
  T: 'bg-yellow-500',
  D: 'bg-orange-500',
  F: 'bg-blue-500',
  L: 'bg-red-500',
  K: 'bg-red-500',
  R: 'bg-red-600',
};

export default SOPHOMORIX_STATUS_CLASS_MAP;
