import DOCKER_PROTECTED_CONTAINERS from '../constants/dockerProtectedContainer';

type TDockerProtectedContainer = (typeof DOCKER_PROTECTED_CONTAINERS)[keyof typeof DOCKER_PROTECTED_CONTAINERS];

export default TDockerProtectedContainer;
