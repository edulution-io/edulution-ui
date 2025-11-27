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

import SSE_EDU_API_ENDPOINTS from '@libs/sse/constants/sseEndpoints';

export const CONFERENCES_EDU_API_ENDPOINT: string = 'conferences';
export const CONFERENCES_JOIN_EDU_API_ENDPOINT = `${CONFERENCES_EDU_API_ENDPOINT}/join`;
export const CONFERENCES_PUBLIC_EDU_API_ENDPOINT = `${CONFERENCES_EDU_API_ENDPOINT}/public`;
export const CONFERENCES_PUBLIC_SSE_EDU_API_ENDPOINT = `${SSE_EDU_API_ENDPOINTS.SSE}/${CONFERENCES_EDU_API_ENDPOINT}/public`;
