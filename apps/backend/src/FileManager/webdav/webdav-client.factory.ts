import { Injectable } from '@nestjs/common';

@Injectable()
export class WebDAVClientFactory {
  createWebDAVClient(username: string, password: string) {}
}
