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

import type { ColumnKey } from '@libs/userManagement/types/columnConfig';

const TEXT_FIELD_REGEX = /^[a-zA-Z0-9äöüÄÖÜß\- ]+$/;

const BIRTHDAY_FORMAT_REGEX = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;

const isValidBirthday = (value: string): boolean => {
  if (!BIRTHDAY_FORMAT_REGEX.test(value)) return false;
  const [day, month, year] = value.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const isValidTextField = (value: string): boolean => TEXT_FIELD_REGEX.test(value);

const COLUMN_VALIDATORS: Record<ColumnKey, (value: string) => boolean> = {
  birthday: isValidBirthday,
  class: isValidTextField,
  category: isValidTextField,
  login: isValidTextField,
  firstName: isValidTextField,
  lastName: isValidTextField,
};

export { TEXT_FIELD_REGEX, BIRTHDAY_FORMAT_REGEX, isValidBirthday, COLUMN_VALIDATORS };
