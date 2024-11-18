export type AppConfigForm = {
  [key: string]: {
    proxyPath: string;
    proxyDestination: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stripPrefix: any;
    proxyConfig: string;
  };
};
