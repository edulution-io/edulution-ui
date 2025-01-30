import { Cache } from 'cache-manager';
import { GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import GroupWithMembers from '@libs/groups/types/groupWithMembers';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Survey } from '../survey.schema';

async function getInvitedMembers(survey: SurveyDto | Survey, cacheManager: Cache): Promise<string[]> {
  const usersInGroups = await Promise.all(
    survey.invitedGroups.map(async (group) => {
      const groupWithMembers = await cacheManager.get<GroupWithMembers>(
        `${GROUPS_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
      );

      return groupWithMembers?.members?.map((member) => member.username) || [];
    }),
  );

  return Array.from(
    new Set([...survey.invitedAttendees.map((attendee) => attendee.username), ...usersInGroups.flat()]),
  );
}

export default getInvitedMembers;
