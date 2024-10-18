import HiddenAttributesBreadcrumb from '@libs/ui/types/HiddenAttributesBreadcrumb';
import UserDto from '@libs/user/types/user.dto';

const filterSegments = (segments: string[], user: UserDto | null): string[] =>
  segments
    .map((segment) => segment.replace(/%20/g, ' '))
    .filter(
      (item) =>
        item !== HiddenAttributesBreadcrumb.teachers.toString() &&
        item !== HiddenAttributesBreadcrumb.students.toString() &&
        item !== user?.ldapGroups.classes[0] &&
        item !== 'global' &&
        item !== HiddenAttributesBreadcrumb.webdav.toString(),
    );

export default filterSegments;
