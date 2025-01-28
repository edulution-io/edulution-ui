const DOCKER_STATES = {
  CREATED: 'created',
  RESTARTING: 'restarting',
  RUNNING: 'running',
  PAUSED: 'paused',
  EXITED: 'exited',
  DEAD: 'dead',
} as const;

export default DOCKER_STATES;
