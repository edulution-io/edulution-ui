type YamlDokument = {
  http: {
    routers: { [key: string]: { rule: string; service: string; tls: Record<string, unknown>; middlewares: string[] } };
    middlewares: {
      [key: string]: {
        stripPrefix: {
          prefixes: string[];
        };
      };
    };
    services: {
      [key: string]: {
        loadBalancer: {
          servers: {
            url: string;
          }[];
        };
      };
    };
  };
};

export default YamlDokument;
