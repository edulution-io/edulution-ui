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

type SophomorixOutputEntry = {
  TYPE: string;
  MESSAGE_EN?: string;
  MESSAGE_DE?: string;
  LOG?: string;
  NUMBER?: number;
};

type SophomorixCheckAddEntry = {
  sophomorixRole: string;
  sophomorixUnid: string;
  givenName: string;
  sn: string;
  identifier_ascii: string;
  sophomorixAdminClass: string;
  sophomorixAdminFile: string;
  sophomorixSchoolname: string;
};

type SophomorixCheckUpdateField = {
  OLD: string;
  NEW: string;
};

type SophomorixCheckUpdateEntry = Record<string, SophomorixCheckUpdateField>;

type SophomorixCheckResult = {
  ADD?: Record<string, SophomorixCheckAddEntry>;
  UPDATE?: Record<string, SophomorixCheckUpdateEntry>;
  KILLLIST?: string[];
  ERRORLIST?: string[];
  ERROR?: Record<string, { REASON: string }>;
  ADDLIST?: string[];
  UPDATELIST?: string[];
};

type SophomorixSummaryEntry = Record<
  string,
  {
    RESULT?: number;
    DESCRIPTION_PRE?: string;
    DESCRIPTION_POST?: string;
    RESULT_TYPE?: string;
    FORMAT_TYPE?: number;
    TITLE?: string;
  }
>;

type SophomorixCheckResponse = {
  CHECK_RESULT: SophomorixCheckResult;
  OUTPUT: SophomorixOutputEntry[];
  SUMMARY?: SophomorixSummaryEntry[];
  SCRIPTNAME: string;
  FILES: Record<string, Record<string, string>>;
  JSONCOMMENT: string;
  JSONINFO: string;
};

export type {
  SophomorixOutputEntry,
  SophomorixCheckAddEntry,
  SophomorixCheckUpdateField,
  SophomorixCheckUpdateEntry,
  SophomorixCheckResult,
  SophomorixSummaryEntry,
  SophomorixCheckResponse,
};
