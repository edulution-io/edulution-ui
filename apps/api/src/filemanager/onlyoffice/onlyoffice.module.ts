import { Module } from '@nestjs/common';
import OnlyofficeService from './onlyoffice.service';

@Module({
  imports: [],
  providers: [OnlyofficeService],
  exports: [OnlyofficeService],
})
export default class OnlyOfficeModule {}
