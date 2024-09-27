import HiddenAttributesBreadcrumb from '@libs/ui/types/HiddenAttributesBreadcrumb';

const filterSegments = (segments: string[], schoolClass: string): string[] =>
  segments
    .map((segment) => segment.replace(/%20/g, ' '))
    .filter(
      (item) =>
        item !== HiddenAttributesBreadcrumb.teachers.toString() &&
        item !== HiddenAttributesBreadcrumb.students.toString() &&
        item !== schoolClass &&
        item !== 'global' &&
        item !== HiddenAttributesBreadcrumb.webdav.toString(),
    );

export default filterSegments;
