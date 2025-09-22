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
import LdapKeycloakSyncService from './ldap-keycloak-sync.service';
import { LdapKeycloakSync, LdapKeycloakSyncSchema } from './ldap-keycloak-sync.schema';
import KeycloakRequestQueue from './queue/keycloak-request.queue';
import GroupsModule from '../groups/groups.module';

@Module({
  imports: [GroupsModule, MongooseModule.forFeature([{ name: LdapKeycloakSync.name, schema: LdapKeycloakSyncSchema }])],
  providers: [LdapKeycloakSyncService, KeycloakRequestQueue],
  exports: [LdapKeycloakSyncService, KeycloakRequestQueue],
})
export default class LdapKeycloakSyncModule {}
