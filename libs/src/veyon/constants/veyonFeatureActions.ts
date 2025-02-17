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

// This constant is based on a third-party object definition from veyon web-API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

const VEYON_FEATURE_ACTIONS = {
  SCREENLOCK: 'ccb535a2-1d24-4cc1-a709-8b47d2b2ac79',
  INPUT_DEVICES_LOCK: 'e4a77879-e544-4fec-bc18-e534f33b934c',
  USER_LOGIN: '7310707d-3918-460d-a949-65bd152cb958',
  USER_LOGOFF: '7311d43d-ab53-439e-a03a-8cb25f7ed526',
  REBOOT: '4f7d98f0-395a-4fff-b968-e49b8d0f748c',
  POWER_DOWN: '6f5a27a0-0e2f-496e-afcc-7aae62eede10',
  DEMO_SERVER: 'e4b6e743-1f5b-491d-9364-e091086200f4',
  FULL_SCREEN_DEMO_CLIENT: '7b6231bd-eb89-45d3-af32-f70663b2f878',
  WINDOW_DEMO_CLIENT: 'ae45c3db-dc2e-4204-ae8b-374cdab8c62c',
  START_APP: 'da9ca56a-b2ad-4fff-8f8a-929b2927b442',
  OPEN_WEBSITE: '8a11a75d-b3db-48b6-b9cb-f8422ddd5b0c',
  TEXT_MESSAGE: 'e75ae9c8-ac17-4d00-8f0d-019348346208',
} as const;

export default VEYON_FEATURE_ACTIONS;
