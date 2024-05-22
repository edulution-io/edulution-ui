import userStore from '@/store/userStore';
import { GroupInfo, SchoolData } from './groups';

export const transformClasses = (classes: Record<string, unknown>): Record<string, unknown> =>
  Object.keys(classes).reduce(
    (acc, key) => {
      const friendlyKey = key.split('/').pop() || key;
      acc[friendlyKey] = classes[key];
      return acc;
    },
    {} as Record<string, unknown>,
  );

export const transformGroupsToSchools = (groups: GroupInfo[]): SchoolData[] => {
  const { userInfo } = userStore.getState();

  return groups.map((group) => {
    const classes = group.subGroups
      .filter((subGroup) => subGroup.name.includes(`s_${userInfo.ldapGroups.school}`))
      .flatMap((subGroup) =>
        subGroup.subGroups.filter((schoolClasses) =>
          schoolClasses.name.includes(`${userInfo.ldapGroups.school}-student`),
        ),
      )
      .flatMap((c) => c.subGroups);

    const printers: GroupInfo[] = group.subGroups
      .filter((subGroup) => subGroup.name.includes(`${userInfo.ldapGroups.school}-r`))
      .flatMap((subGroup) => [
        subGroup,
        ...subGroup.subGroups.filter((innerSubGroup) => innerSubGroup.name.includes(`${userInfo.ldapGroups.school}-r`)),
      ]);

    const projects = groups.filter((topGroup) => topGroup.name.startsWith(`p_${userInfo.ldapGroups.school}`));

    return {
      id: group.id,
      name: group.name,
      classes,
      printers,
      projects,
    };
  });
};

export default { transformGroupsToSchools, transformClasses };
