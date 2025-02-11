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

import Dockerode from 'dockerode';

const extractEnvPlaceholders = (containerConfig: Dockerode.ContainerCreateOptions[]): Record<string, string> => {
  const placeholderPattern = /^<(.+)>$/;

  return containerConfig.reduce(
    (acc, service) => {
      const envObj = service.Env;
      if (envObj && typeof envObj === 'object') {
        Object.values(envObj).forEach((value) => {
          if (typeof value === 'string') {
            const match = value.match(placeholderPattern);
            if (match) {
              acc[match[1]] = '';
            }
          }
        });
      }
      return acc;
    },
    {} as Record<string, string>,
  );
};

export default extractEnvPlaceholders;
