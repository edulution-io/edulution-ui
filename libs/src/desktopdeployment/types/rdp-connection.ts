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

/* eslint-disable */

// This DTO is based on a third-party object definition from apache/guacamole.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
export class Parameters {
  port: string = '3389';
  'read-only': string = '';
  'swap-red-blue': string = '';
  cursor: string = '';
  'color-depth': string = '';
  'clipboard-encoding': string = '';
  'disable-copy': string = '';
  'disable-paste': string = '';
  'dest-port': string = '';
  'recording-exclude-output': string = '';
  'recording-exclude-mouse': string = '';
  'recording-include-keys': string = '';
  'create-recording-path': string = '';
  'enable-sftp': string = '';
  'sftp-port': string = '';
  'sftp-server-alive-interval': string = '';
  'enable-audio': string = '';
  security: string = 'nla';
  'disable-auth': string = '';
  'ignore-cert': string = 'true';
  'gateway-port': string = '';
  'server-layout': string = '';
  timezone: string = '';
  console: string = '';
  width: string = '';
  height: string = '';
  dpi: string = '';
  'resize-method': string = 'display-update';
  'console-audio': string = '';
  'disable-audio': string = '';
  'enable-audio-input': string = '';
  'enable-printing': string = '';
  'enable-drive': string = '';
  'create-drive-path': string = '';
  'enable-wallpaper': string = 'true';
  'enable-theming': string = '';
  'enable-font-smoothing': string = '';
  'enable-full-window-drag': string = '';
  'enable-desktop-composition': string = '';
  'enable-menu-animations': string = '';
  'disable-bitmap-caching': string = '';
  'disable-offscreen-caching': string = '';
  'disable-glyph-caching': string = '';
  'preconnection-id': string = '';
  hostname: string = '';
  username: string = '';
  password: string = '';
  domain: string = '';
  'gateway-hostname': string = '';
  'gateway-username': string = '';
  'gateway-password': string = '';
  'gateway-domain': string = '';
  'initial-program': string = '';
  'client-name': string = '';
  'printer-name': string = '';
  'drive-name': string = '';
  'drive-path': string = '';
  'static-channels': string = '';
  'remote-app': string = '';
  'remote-app-dir': string = '';
  'remote-app-args': string = '';
  'preconnection-blob': string = '';
  'load-balance-info': string = '';
  'recording-path': string = '';
  'recording-name': string = '';
  'sftp-hostname': string = '';
  'sftp-host-key': string = '';
  'sftp-username': string = '';
  'sftp-password': string = '';
  'sftp-private-key': string = '';
  'sftp-passphrase': string = '';
  'sftp-root-directory': string = '';
  'sftp-directory': string = '';
}

export class Attributes {
  'max-connections': string = '';
  'max-connections-per-user': string = '';
  weight: string = '';
  'failover-only': string = '';
  'guacd-port': string = '';
  'guacd-encryption': string = '';
  'guacd-hostname': string = '';
}

export class RDPConnection {
  parentIdentifier: string = 'ROOT';
  name: string = '';
  protocol: string = 'rdp';
  parameters: Parameters = new Parameters();
  attributes: Attributes = new Attributes();
}
