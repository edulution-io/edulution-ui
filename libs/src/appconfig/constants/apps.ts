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

const APPS = {
  DASHBOARD: 'dashboard',
  BULLETIN_BOARD: 'bulletinboard',
  TICKET_SYSTEM: 'ticketsystem',
  MAIL: 'mail',
  CHAT: 'chat',
  CONFERENCES: 'conferences',
  SURVEYS: 'surveys',
  KNOWLEDGE_BASE: 'knowledgebase',
  FILE_SHARING: 'filesharing',
  FORUMS: 'forums',
  ROOM_BOOKING: 'roombooking',
  LEARNING_MANAGEMENT: 'learningmanagement',
  SCHOOL_INFORMATION: 'schoolinformation',
  CLASS_MANAGEMENT: 'classmanagement',
  PRINTER: 'printer',
  NETWORK: 'network',
  LOCATION_SERVICES: 'locationservices',
  DESKTOP_DEPLOYMENT: 'desktopdeployment',
  WLAN: 'wlan',
  MOBILE_DEVICES: 'mobiledevices',
  VIRTUALIZATION: 'virtualization',
  FIREWALL: 'firewall',
  ANTIMALWARE: 'antimalware',
  BACKUP: 'backup',
  AICHAT: 'aichat',
  LINUXMUSTER: 'linuxmuster',
  WHITEBOARD: 'whiteboard',
  SETTINGS: 'settings',
  USER_SETTINGS: 'usersettings',
  NONE: 'none',
  FORWARDING: 'forwarding',
  FRAME: 'frame',
  EMBEDDED: 'embedded',
  APPSTORE: 'appstore',
} as const;

export default APPS;
