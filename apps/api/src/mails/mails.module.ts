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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MailsController from './mails.controller';
import MailsService from './mails.service';
import { MailProvider, MailProviderSchema } from './mail-provider.schema';
import DockerModule from '../docker/docker.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: MailProvider.name, schema: MailProviderSchema }]), DockerModule],
  controllers: [MailsController],
  providers: [MailsService],
})
export default class MailsModule {}
