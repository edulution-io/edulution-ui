/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import UserDto from '@libs/user/types/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UserAccountDto from '@libs/user/types/userAccount.dto';
import { EDU_API_USER_ACCOUNTS_ENDPOINT, EDU_API_USERS_ENDPOINT } from '@libs/user/constants/usersApiEndpoints';
import { NOTIFICATION_DEVICES_EDU_API_ENDPOINT } from '@libs/notification/constants/apiEndpoints';
import UserDeviceDto from '@libs/notification/types/userDevice.dto';
import CustomHttpException from '../common/CustomHttpException';
import UsersService from './users.service';
import UpdateUserDto from './dto/update-user.dto';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentOrganisationPrefix from '../common/decorators/getCurrentOrganisationPrefix.decorator';
import DeploymentTargetInterceptor from '../common/interceptors/deploymentTarget.interceptor';

@ApiTags(EDU_API_USERS_ENDPOINT)
@ApiBearerAuth()
@Controller(EDU_API_USERS_ENDPOINT)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  static throwIfNotCurrentUser(username: string, currentUsername: string) {
    if (username !== currentUsername) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        undefined,
        UsersController.name,
      );
    }
  }

  @Post()
  createOrUpdate(@Body() userDto: UserDto) {
    return this.usersService.createOrUpdate(userDto);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  @Get(':username/key')
  async findOneKey(@Param('username') username: string, @GetCurrentUsername() currentUsername: string) {
    UsersController.throwIfNotCurrentUser(username, currentUsername);

    const response = await this.usersService.getPassword(currentUsername);

    if (!response) {
      throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.FORBIDDEN);
    }

    return Buffer.from(response).toString('base64');
  }

  @Patch(':username')
  update(@Param('username') username: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(username, updateUserDto);
  }

  @Delete(':username')
  remove(@Param('username') username: string) {
    return this.usersService.remove(username);
  }

  @UseInterceptors(DeploymentTargetInterceptor)
  @Get('search/:searchString')
  async search(
    @Param('searchString') searchString: string,
    @GetCurrentOrganisationPrefix() currentOrganisationPrefix: string,
  ) {
    return this.usersService.searchUsersByName(currentOrganisationPrefix, searchString);
  }

  @Post(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}`)
  addUserAccount(
    @Param('username') username: string,
    @GetCurrentUsername() currentUsername: string,
    @Body() userAccountDto: Omit<UserAccountDto, 'accountId'>,
  ) {
    UsersController.throwIfNotCurrentUser(username, currentUsername);

    return this.usersService.addUserAccount(currentUsername, userAccountDto);
  }

  @Get(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}`)
  getUserAccounts(@Param('username') username: string, @GetCurrentUsername() currentUsername: string) {
    UsersController.throwIfNotCurrentUser(username, currentUsername);

    return this.usersService.getUserAccounts(currentUsername);
  }

  @Patch(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}/:accountId`)
  updateUserAccount(
    @Param('username') username: string,
    @Param('accountId') accountId: string,
    @GetCurrentUsername() currentUsername: string,
    @Body() userAccountDto: UserAccountDto,
  ) {
    UsersController.throwIfNotCurrentUser(username, currentUsername);

    return this.usersService.updateUserAccount(currentUsername, accountId, userAccountDto);
  }

  @Delete(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}/:accountId`)
  deleteUserAccount(
    @Param('username') username: string,
    @Param('accountId') accountId: string,
    @GetCurrentUsername() currentUsername: string,
  ) {
    UsersController.throwIfNotCurrentUser(username, currentUsername);

    return this.usersService.deleteUserAccount(currentUsername, accountId);
  }

  @Patch(`:username/${NOTIFICATION_DEVICES_EDU_API_ENDPOINT}`)
  async registerDevice(
    @Param('username') username: string,
    @GetCurrentUsername() currentUsername: string,
    @Body() userDeviceDto: UserDeviceDto,
  ) {
    UsersController.throwIfNotCurrentUser(username, currentUsername);
    return this.usersService.updateDeviceByUsername(currentUsername, userDeviceDto);
  }

  @Delete(`:username/${NOTIFICATION_DEVICES_EDU_API_ENDPOINT}`)
  async unregisterDevice(
    @Param('username') username: string,
    @GetCurrentUsername() currentUsername: string,
    @Body() userDeviceDto: UserDeviceDto,
  ) {
    UsersController.throwIfNotCurrentUser(username, currentUsername);
    return this.usersService.clearDeviceByUsername(currentUsername, userDeviceDto);
  }
}

export default UsersController;
