import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Docker from 'dockerode';

type CreateContainerResponse = { Id: string; Warnings: string[] };

@Injectable()
class DockerService {
  private readonly dockerApiUrl = 'http://localhost:2375';

  private readonly dockerSocketPath = '/var/run/docker.sock';

  private readonly docker = new Docker({ socketPath: this.dockerSocketPath });

  async getContainers() {
    try {
      const containers = await this.docker.listContainers();
      return containers;
    } catch (error) {
      throw new Error('Docker API not responding');
    }
  }

  async pullImage(fromImage: string, tag: string) {
    try {
      await axios.post(`${this.dockerApiUrl}/images/create`, undefined, {
        params: { fromImage, tag },
      });
    } catch (error) {
      throw new Error('Docker API not responding');
    }
  }

  async createContainer(createContainerDto: { image: string }) {
    const { image } = createContainerDto;
    try {
      const { data } = await axios.post<CreateContainerResponse>(`${this.dockerApiUrl}/containers/create`, {
        Image: image,
      });
      return data;
    } catch (error) {
      throw new Error('Docker API not responding');
    }
  }

  async executeContainerCommand(params: { id: string; operation: string }) {
    const { id, operation } = params;
    try {
      const { data } = await axios.post<CreateContainerResponse>(`${this.dockerApiUrl}/containers/${id}/${operation}`);
      return data;
    } catch (error) {
      throw new Error('Docker API not responding');
    }
  }
}

export default DockerService;
