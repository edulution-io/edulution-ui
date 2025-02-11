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

type DockerCompose = {
  services: {
    [key: string]: {
      image: string;
      container_name?: string;
      volumes?: string[];
      environment?: string[];
      restart?: string;
      ports?: string[];
      command?: string;
      depends_on?: string[];
    };
  };
  volumes?: {
    [key: string]: {
      driver?: string;
      driver_opts?: {
        [key: string]: string;
      };
    };
  };
  networks?: {
    [key: string]: {
      external?: boolean;
    };
  };
};

export default DockerCompose;
