import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AppConfigModule from '../appconfig/appconfig.module';
import { License, LicenseSchema } from './license.schema';
import LicenseController from './license.controller';
import LicenseService from './license.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: License.name, schema: LicenseSchema }]), AppConfigModule],
  controllers: [LicenseController],
  providers: [LicenseService],
})
export default class LicenseModule {}
