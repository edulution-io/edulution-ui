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
