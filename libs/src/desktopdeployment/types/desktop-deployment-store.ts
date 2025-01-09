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
