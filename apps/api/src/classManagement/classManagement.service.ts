import { Injectable } from '@nestjs/common';
import GroupsService from '../groups/groups.service';

@Injectable()
class ClassManagementService {
  constructor(private readonly groupsService: GroupsService) {}

  public async getClassMembers(token: string, groupPath: string) {
    const classInfo = await this.groupsService.fetchGroupByPath(token, groupPath);
    const groupId = classInfo.id;

    const members = await this.groupsService.fetchGroupMembers(token, groupId);
    const memberDetails = members.map((member) => this.groupsService.fetchUserById(token, member.id));

    return Promise.all(memberDetails);
  }
}
export default ClassManagementService;
