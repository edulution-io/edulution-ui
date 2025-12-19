/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
