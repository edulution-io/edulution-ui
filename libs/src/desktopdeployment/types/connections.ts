// This DTO is based on a third-party object definition from apache/guacamole.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
type ConnectionAttributes = {
  'guacd-encryption': string;
  'failover-only': string | null;
  weight: string | null;
  'max-connections': string;
  'guacd-hostname': string | null;
  'guacd-port': string | null;
  'max-connections-per-user': string;
};

type Connection = {
  name: string;
  identifier: string;
  parentIdentifier: string;
  protocol: string;
  attributes: ConnectionAttributes;
  activeConnections: number;
  lastActive: number;
};

type Connections = {
  [key: string]: Connection;
};

export default Connections;
