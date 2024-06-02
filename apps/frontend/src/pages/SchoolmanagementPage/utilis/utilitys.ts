import userStore from '@/store/userStore';
import { GroupInfo, SchoolData } from './groups';
import eduApi from '@/api/eduApi.ts';
import { LDAPUser } from '@/pages/SchoolmanagementPage/store/ldapUser.ts';
import { CustomIdTokenClaims } from '@/pages/SchoolmanagementPage/utilis/types.ts';

export const transformClasses = (classes: Record<string, any>): Record<string, any> =>
  Object.keys(classes)?.reduce(
    (acc, key) => {
      const friendlyKey = key.split('/').pop() || key;
      acc[friendlyKey] = classes[key];
      return acc;
    },
    {} as Record<string, any>,
  );

export const fetchAndFilterData = async (
  items: string[],
  endpoint: string,
  userInfo: CustomIdTokenClaims,
  isPersonal: boolean,
) => {
  const excludedMemberName = userInfo.name;

  const infoPromises = items?.map(async (itemName) => {
    const response = await eduApi.get(`/${endpoint}/${itemName}`);
    const info = response.data as LDAPUser[];
    if (!isPersonal) {
      info.filter((member) => !member.username.includes(excludedMemberName));
    }
    return { [itemName]: info };
  });

  const infoArray = await Promise.all(infoPromises);
  const validInfoArray = infoArray.filter((info) => info !== null);

  const infoMap = validInfoArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  Object.entries(infoMap).forEach(([key, members]) => {
    infoMap[key] = members.filter((member) => member.email !== userInfo.email);
  });

  return infoMap;
};

export const transformGroupsToSchools = (groups: GroupInfo[]): SchoolData[] => {
  const { userInfo } = userStore.getState();
  return groups.map((group) => {
    const classes = group.subGroups
      .filter((subGroup) => subGroup.name.includes(`s_${userInfo?.ldapGroups?.school}`))
      .flatMap((subGroup) =>
        subGroup.subGroups.filter((schoolClasses) =>
          schoolClasses.name.includes(`${userInfo?.ldapGroups?.school}-student`),
        ),
      )
      .flatMap((c) => c.subGroups);

    const printers: GroupInfo[] = group.subGroups
      .filter((subGroup) => subGroup.name.includes(`${userInfo?.ldapGroups?.school}-r`))
      .flatMap((subGroup) => [
        subGroup,
        ...subGroup.subGroups.filter((innerSubGroup) =>
          innerSubGroup.name.includes(`${userInfo?.ldapGroups?.school}-r`),
        ),
      ]);

    const projects = groups.filter((topGroup) => topGroup.name.startsWith(`p_${userInfo?.ldapGroups?.school}`));

    return {
      id: group.id,
      name: group.name,
      classes,
      printers,
      projects,
    };
  });
};

export const getLastPartOfPath = (path: string) => {
  const lastSlashIndex = path.lastIndexOf('/');
  return path.substring(lastSlashIndex + 1);
};

export const formatTimestamp = (ts: string, timeZone = 'UTC') => {
  const year = +ts.slice(0, 4);
  const month = +ts.slice(4, 6);
  const day = +ts.slice(6, 8);
  const hour = +ts.slice(8, 10);
  const minute = +ts.slice(10, 12);
  const second = +ts.slice(12, 14);

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  return date.toLocaleString('de-DE', { timeZone, timeZoneName: 'short' });
};

export default { transformGroupsToSchools, transformClasses };
