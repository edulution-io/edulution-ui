type DockerEvent = {
  status: string;
  id: string;
  from: string;
  Type: string;
  Action: string;
  Actor: {
    ID: string;
    Attributes: {
      [key: string]: string;
    };
  };
  time: number;
  timeNano: number;
  progress: string;
};

export default DockerEvent;
