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

import DEPLOYMENT_TARGET from '../constants/deployment-target';
import type DeploymentTarget from '../types/deployment-target';

const VALID_TARGETS = new Set<DeploymentTarget>(Object.values(DEPLOYMENT_TARGET));

const { EDUI_DEPLOYMENT_TARGET = DEPLOYMENT_TARGET.LINUXMUSTER } = process.env;

const getDeploymentTarget = (): DeploymentTarget =>
  VALID_TARGETS.has(EDUI_DEPLOYMENT_TARGET as DeploymentTarget)
    ? (EDUI_DEPLOYMENT_TARGET as DeploymentTarget)
    : DEPLOYMENT_TARGET.LINUXMUSTER;

export default getDeploymentTarget;
