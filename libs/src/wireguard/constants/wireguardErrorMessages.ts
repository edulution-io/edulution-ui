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

const WIREGUARD_ERROR_MESSAGES = {
  GET_PEERS_FAILED: 'wireguard.errors.getPeersFailed',
  CREATE_PEER_FAILED: 'wireguard.errors.createPeerFailed',
  DELETE_PEER_FAILED: 'wireguard.errors.deletePeerFailed',
  GET_PEER_CONFIG_FAILED: 'wireguard.errors.getPeerConfigFailed',
  GET_PEER_QR_FAILED: 'wireguard.errors.getPeerQrFailed',
  GET_PEER_STATUS_FAILED: 'wireguard.errors.getPeerStatusFailed',
  GET_PEERS_STATUS_FAILED: 'wireguard.errors.getPeersStatusFailed',
  RESTART_FAILED: 'wireguard.errors.restartFailed',
  GET_SITES_FAILED: 'wireguard.errors.getSitesFailed',
  CREATE_SITE_FAILED: 'wireguard.errors.createSiteFailed',
  DELETE_SITE_FAILED: 'wireguard.errors.deleteSiteFailed',
  GET_SITE_CONFIG_FAILED: 'wireguard.errors.getSiteConfigFailed',
} as const;

export default WIREGUARD_ERROR_MESSAGES;
