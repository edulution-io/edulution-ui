type VdiConnectionRequest = {
  status: string;
  data: {
    ip: string;
    configFile: string;
  };
};

export default VdiConnectionRequest;
