import DOCKER_COMMANDS from '../constants/dockerCommands';

type TDockerCommands = (typeof DOCKER_COMMANDS)[keyof typeof DOCKER_COMMANDS];

export default TDockerCommands;
