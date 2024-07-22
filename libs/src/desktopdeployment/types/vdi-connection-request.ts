type LmnVdiResponse = {
  status: string;
  data: {
    ip: string;
    configFile: string;
  };
};

export default LmnVdiResponse;
