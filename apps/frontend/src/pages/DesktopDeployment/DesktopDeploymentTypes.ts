type ConnectionAttributes = {
  'guacd-encryption': string;
  'failover-only': string | null;
  weight: string | null;
  'max-connections': string;
  'guacd-hostname': string | null;
  'guacd-port': string | null;
  'max-connections-per-user': string;
};

export type Connection = {
  name: string;
  identifier: string;
  parentIdentifier: string;
  protocol: string;
  attributes: ConnectionAttributes;
  activeConnections: number;
  lastActive: number;
};

export type Connections = {
  [key: string]: Connection;
};

export type VdiConnectionRequest = {
  status: string;
  data: {
    ip: string;
    configFile: string;
  };
};

export type StatusOfClones = {
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
