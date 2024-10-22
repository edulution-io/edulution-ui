import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import UserDto from '@libs/user/types/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UsersService from './users.service';
import UpdateUserDto from './dto/update-user.dto';
import GetToken from '../common/decorators/getToken.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
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
  async search(@GetToken() token: string, @Param('searchString') searchString: string) {
    return this.usersService.searchUsersByName(token, searchString);
  }
}

export default UsersController;
