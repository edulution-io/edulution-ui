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

const IFRAME_ALLOWED_CONFIG = [
  'autoplay *',
  'camera *',
  'microphone *',
  'display-capture *',
  'fullscreen *',
  'picture-in-picture *',
  'screen-wake-lock *',

  'geolocation *',
  'accelerometer *',
  'gyroscope *',
  'magnetometer *',

  'clipboard-read *',
  'clipboard-write *',

  'gamepad *',
  'keyboard-map *',
  'xr-spatial-tracking *',

  'usb *',
  'serial *',
  'bluetooth *',
  'hid *',
  'midi *',
  'nfc *',
  'speaker-selection *',

  'payment *',
  'encrypted-media *',
  'sync-xhr *',

  'idle-detection *',
  'local-fonts *',

  'clipboard-read *',
  'clipboard-write *',
  'interest-cohort *',
  'browsing-topics *',
  'attribution-reporting *',
  'run-ad-auction *',
  'join-ad-interest-group *',
  'shared-autofill *',
].join('; ');

export default IFRAME_ALLOWED_CONFIG;
