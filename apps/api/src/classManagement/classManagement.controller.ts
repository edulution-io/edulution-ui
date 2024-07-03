import { Controller, Get, Param } from '@nestjs/common';
import ClassManagementService from './classManagement.service';
import GetTokenDecorator from '../common/decorators/getToken.decorator';

@Controller('classmanagement')
export class ClassManagementController {
  constructor(private readonly classManagementService: ClassManagementService) {}

  @Get(':groupPath')
  async getClassMembersWithDetails(@GetTokenDecorator() token: string, @Param('groupPath') groupPath: string) {
    return this.classManagementService.getClassMembers(token, groupPath);
  }
}

export default ClassManagementController;
