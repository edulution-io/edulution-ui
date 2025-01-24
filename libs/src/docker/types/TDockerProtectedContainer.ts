import DOCKER_PROTECTED_CONTAINER from '../constants/dockerProtectedContainer';

type TDockerProtectedContainer = (typeof DOCKER_PROTECTED_CONTAINER)[keyof typeof DOCKER_PROTECTED_CONTAINER];

export default TDockerProtectedContainer;
