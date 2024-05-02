import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import AuthenticationGuard from './auth.guard';

@Module({
  imports: [HttpModule],
  providers: [AuthenticationGuard],
})
export default class AuthenticationModule {}
