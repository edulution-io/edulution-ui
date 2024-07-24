import CloneVms from './clone-vms';
import VirtualMachineOs from './virtual-machines.enum';

type VirtualMachines = {
  status: string;
  data: {
    [key in VirtualMachineOs]: {
      summary: {
        allocated_vms: number;
        available_vms: number;
        existing_vms: number;
        registered_vms: number;
        building_vms: number;
        failed_vms: number;
      };
      clone_vms: CloneVms;
    };
  };
};

export default VirtualMachines;
