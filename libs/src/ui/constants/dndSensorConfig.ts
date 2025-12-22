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

const MOUSE_SENSOR_ACTIVATION_DISTANCE_PX = 8;

const TOUCH_SENSOR_ACTIVATION_DELAY_MS = 250;
const TOUCH_SENSOR_ACTIVATION_TOLERANCE_PX = 5;

const DND_SENSOR_CONFIG = {
  MOUSE: {
    ACTIVATION_DISTANCE: MOUSE_SENSOR_ACTIVATION_DISTANCE_PX,
  },
  TOUCH: {
    ACTIVATION_DELAY: TOUCH_SENSOR_ACTIVATION_DELAY_MS,
    ACTIVATION_TOLERANCE: TOUCH_SENSOR_ACTIVATION_TOLERANCE_PX,
  },
} as const;

export default DND_SENSOR_CONFIG;
