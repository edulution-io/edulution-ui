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

const DOCKER_CONTAINER_TABLE_COLUMNS = {
  STATE_BADGE: 'state-badge',
  NAME: 'name',
  CONTAINER_IMAGE: 'container-image',
  CONTAINER_STATE: 'container-state',
  CONTAINER_STATUS: 'container-status',
  CONTAINER_PORT: 'container-port',
  CONTAINER_CREATION_DATE: 'container-creation-date',
} as const;

export default DOCKER_CONTAINER_TABLE_COLUMNS;
