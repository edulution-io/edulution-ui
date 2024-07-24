import { Group } from '@libs/groups/types/group';
import SchoolData from '@libs/classManagement/types/schoolData';

const transformGroupsToSchools = (groups: Group[], userSchool?: string): SchoolData[] => {
  return groups.map((group) => {
    const classes = group.subGroups
      .filter((subGroup) => subGroup.name.includes(`s_${userSchool}`))
      .flatMap((subGroup) =>
        subGroup.subGroups.filter((schoolClasses) => schoolClasses.name.includes(`${userSchool}-student`)),
      )
      .flatMap((c) => c.subGroups);

    const printers: Group[] = group.subGroups
      .filter((subGroup) => subGroup.name.includes(`${userSchool}-r`))
      .flatMap((subGroup) => [
        subGroup,
        ...subGroup.subGroups.filter((innerSubGroup) => innerSubGroup.name.includes(`${userSchool}-r`)),
      ]);

    const projects = groups.filter((topGroup) => topGroup.name.startsWith(`p_${userSchool}`));

    return {
      id: group.id,
      name: group.name,
      classes,
      printers,
      projects,
    };
  });
};

export default transformGroupsToSchools;
