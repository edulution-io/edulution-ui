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

import { ContainerCreateOptions } from 'dockerode';

const updateContainerConfig = (
  containerConfig: ContainerCreateOptions[],
  formValues: Record<string, string>,
): ContainerCreateOptions[] => {
  const placeholderPattern = /^<(.+)>$/;

  return containerConfig.map((service) => {
    if (service.Env && typeof service.Env === 'object' && !Array.isArray(service.Env)) {
      const envObj = service.Env as Record<string, string>;
      const updatedEnvObj: Record<string, string> = {};

      Object.keys(envObj).forEach((key) => {
        const value = envObj[key];
        if (typeof value === 'string') {
          const match = value.match(placeholderPattern);
          if (match) {
            const placeholderName = match[1];

            updatedEnvObj[key] = formValues[placeholderName] ?? value;
          } else {
            updatedEnvObj[key] = value;
          }
        } else {
          updatedEnvObj[key] = String(value);
        }
      });

      const updatedEnvArray = Object.entries(updatedEnvObj).map(([key, value]) => `${key}=${value}`);
      return { ...service, Env: updatedEnvArray };
    }
    return service;
  });
};

export default updateContainerConfig;
