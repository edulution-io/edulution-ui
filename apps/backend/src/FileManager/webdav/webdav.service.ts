import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { WebDAVClientFactory } from './webdav-client.factory';

@Injectable({ scope: Scope.REQUEST })
export class WebDAVService {
  private client;

  constructor(
    private factory: WebDAVClientFactory,
    @Inject(REQUEST) private request: Request,
  ) {
    const username = 'mustan';
    const password = 'Muster!';
    this.client = this.factory.createWebDAVClient(username, password);
  }

  public async getFile(path: string) {
    return 'Hallo';
  }
}
