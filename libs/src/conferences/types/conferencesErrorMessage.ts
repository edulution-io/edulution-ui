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

enum ConferencesErrorMessage {
  MeetingNotFound = 'conferences.errors.MeetingNotFound',
  CouldNotStartConference = 'conferences.errors.CouldNotStartConference',
  CouldNotStopConference = 'conferences.errors.CouldNotStopConference',
  BbbServerNotReachable = 'conferences.errors.BbbServerNotReachable',
  BbbUnauthorized = 'conferences.errors.BbbUnauthorized',
  AppNotProperlyConfigured = 'conferences.errors.AppNotProperlyConfigured',
  YouAreNotTheCreator = 'conferences.errors.YouAreNotTheCreator',
  DBAccessFailed = 'conferences.errors.DBAccessFailed',
  WrongPassword = 'conferences.errors.WrongPassword',
  ConferenceIsNotRunning = 'conferences.errors.ConferenceIsNotRunning',
  MissingMandatoryParameters = 'conferences.errors.MissingMandatoryParameters',
}

export default ConferencesErrorMessage;
