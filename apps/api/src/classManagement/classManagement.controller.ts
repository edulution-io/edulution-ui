import { Controller, Get, Param } from '@nestjs/common';
import ClassManagementService from './classManagement.service';
import GetTokenDecorator from '../common/decorators/getToken.decorator';

@Controller('classmanagement')
export class ClassManagementController {
  constructor(private readonly classManagementService: ClassManagementService) {}

  @Get('groups')
  async getGroups(@GetTokenDecorator() token: string) {
    return this.classManagementService.fetchAllGroups(token);
  }

  @Get('*')
  async getClassMembersWithDetails(@GetTokenDecorator() token: string, @Param() params: string) {
    const className = params[0] || '';
    console.log('className', className);
    return this.classManagementService.getClassMembersWithDetails(token, className);
  }
}

export default ClassManagementController;
