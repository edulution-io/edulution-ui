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

import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import UserDto from '@libs/user/types/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UserAccountDto from '@libs/user/types/userAccount.dto';
import { EDU_API_USERS_ENDPOINT, EDU_API_USER_ACCOUNTS_ENDPOINT } from '@libs/user/constants/usersApiEndpoints';
import UsersService from './users.service';
import UpdateUserDto from './dto/update-user.dto';
import GetToken from '../common/decorators/getToken.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentSchool from '../common/decorators/getCurrentSchool.decorator';

@ApiTags(EDU_API_USERS_ENDPOINT)
@ApiBearerAuth()
@Controller(EDU_API_USERS_ENDPOINT)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    if (username !== currentUsername) {
      throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.FORBIDDEN);
    }
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

  @Get('search/:searchString')
  async search(
    @GetToken() token: string,
    @Param('searchString') searchString: string,
    @GetCurrentSchool() school: string,
  ) {
    return this.usersService.searchUsersByName(token, school, searchString);
  }

  @Post(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}`)
  addUserAccount(
    @Param('username') username: string,
    @GetCurrentUsername() currentUsername: string,
    @Body() userAccountDto: Omit<UserAccountDto, 'accountId'>,
  ) {
    if (username !== currentUsername) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        undefined,
        UsersController.name,
      );
    }

    return this.usersService.addUserAccount(currentUsername, userAccountDto);
  }

  @Get(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}`)
  getUserAccounts(@Param('username') username: string, @GetCurrentUsername() currentUsername: string) {
    if (username !== currentUsername) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        undefined,
        UsersController.name,
      );
    }

    return this.usersService.getUserAccounts(currentUsername);
  }

  @Patch(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}/:accountId`)
  updateUserAccount(
    @Param('username') username: string,
    @Param('accountId') accountId: string,
    @GetCurrentUsername() currentUsername: string,
    @Body() userAccountDto: UserAccountDto,
  ) {
    if (username !== currentUsername) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        undefined,
        UsersController.name,
      );
    }

    return this.usersService.updateUserAccount(currentUsername, accountId, userAccountDto);
  }

  @Delete(`:username/${EDU_API_USER_ACCOUNTS_ENDPOINT}/:accountId`)
  deleteUserAccount(
    @Param('username') username: string,
    @Param('accountId') accountId: string,
    @GetCurrentUsername() currentUsername: string,
  ) {
    if (username !== currentUsername) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        undefined,
        UsersController.name,
      );
    }

    return this.usersService.deleteUserAccount(currentUsername, accountId);
  }
}

export default UsersController;
