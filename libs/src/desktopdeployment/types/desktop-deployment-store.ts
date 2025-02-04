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

import { AxiosError } from 'axios';
import Connections from './connections';
import VirtualMachines from './virtual-machines';

type DesktopDeploymentStore = {
  connectionEnabled: boolean;
  vdiIp: string;
  guacToken: string;
  dataSource: string;
  isLoading: boolean;
  error: AxiosError | null;
  connections: Connections | null;
  isVdiConnectionOpen: boolean;
  guacId: string;
  virtualMachines: VirtualMachines | null;
  setError: (error: AxiosError | null) => void;
  setIsVdiConnectionOpen: (isVdiConnectionOpen: boolean) => void;
  setGuacToken: (guacToken: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setGuacId: (guacId: string) => void;
  setVirtualMachines: (virtualMachines: VirtualMachines) => void;
  authenticate: () => Promise<void>;
  getConnection: () => Promise<void>;
  postRequestVdi: (group: string) => Promise<void>;
  getVirtualMachines: (isSilent: boolean) => Promise<void>;
  createOrUpdateConnection: () => Promise<void>;
  reset: () => void;
};

export default DesktopDeploymentStore;
