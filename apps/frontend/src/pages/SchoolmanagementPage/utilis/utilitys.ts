import userStore from '@/store/userStore';
// @ts-ignore
import { GroupInfo, SchoolData } from 'apps/api/src/types/groups';

export const transformClasses = (classes: Record<string, any>): Record<string, any> =>
  Object.keys(classes).reduce(
    (acc, key) => {
      const friendlyKey = key.split('/').pop() || key;
      acc[friendlyKey] = classes[key];
      return acc;
    },
    {} as Record<string, any>,
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
      .flatMap((classes) => classes.subGroups);

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
