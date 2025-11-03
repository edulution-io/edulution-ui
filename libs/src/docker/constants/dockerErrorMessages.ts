/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

enum DockerErrorMessages {
  DOCKER_CONNECTION_ERROR = 'docker.error.dockerConnectionError',
  DOCKER_IMAGE_NOT_FOUND = 'docker.error.dockerImageNotFound',
  DOCKER_CREATION_ERROR = 'docker.error.dockerCreationError',
  DOCKER_COMMAND_EXECUTION_ERROR = 'docker.error.dockerCommandExecutionError',
  DOCKER_CONTAINER_DELETION_ERROR = 'docker.error.dockerContainerDeletionError',
  DOCKER_UPDATE_ERROR = 'docker.error.dockerUpdateError',
}

export default DockerErrorMessages;
