type StatusOfClones = {
  status: string;
  data: {
    [vmType: string]: {
      summary: {
        allocated_vms: number;
        available_vms: number;
        existing_vms: number;
        registered_vms: number;
        building_vms: number;
        failed_vms: number;
      };
      clone_vms: {
        [vmId: string]: unknown;
      };
    };
  };
};

export default StatusOfClones;
