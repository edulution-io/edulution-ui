import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import AuthenticationGuard from './auth.guard';
import { AuthenticationService } from './auth.service';

@Module({
  imports: [HttpModule],
  providers: [AuthenticationGuard, AuthenticationService],
  exports: [AuthenticationService],
})
export default class AuthenticationModule {}
