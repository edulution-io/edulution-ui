// This DTO is based on a third-party object definition from apache/guacamole.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
type ConnectionAttributes = {
  [key: string]: string;
};

type Item = {
  name: string;
  identifier: string;
  parentIdentifier: string;
  protocol: string;
  attributes: ConnectionAttributes;
  activeConnections: number;
  lastActive?: number;
};

type GuacamoleConnections = {
  [key: string]: Item;
};

export default GuacamoleConnections;
