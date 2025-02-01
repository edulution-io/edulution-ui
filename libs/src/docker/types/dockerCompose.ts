type DockerCompose = {
  services: {
    [key: string]: {
      image: string;
      container_name?: string;
      volumes?: string[];
      environment?: string[];
      restart?: string;
      ports?: string[];
      command?: string;
      depends_on?: string[];
    };
  };
  volumes?: {
    [key: string]: {
      driver?: string;
      driver_opts?: {
        [key: string]: string;
      };
    };
  };
  networks?: {
    [key: string]: {
      external?: boolean;
    };
  };
};

export default DockerCompose;
