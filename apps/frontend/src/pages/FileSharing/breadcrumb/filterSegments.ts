import HiddenAttributesBreadcrumb from '@libs/ui/types/HiddenAttributesBreadcrumb';

const filterSegments = (segments: string[]): string[] =>
  segments.filter(
    (item) =>
      item !== HiddenAttributesBreadcrumb.teachers.toString() &&
      item !== HiddenAttributesBreadcrumb.students.toString() &&
      item !== HiddenAttributesBreadcrumb.webdav.toString(),
  );

export default filterSegments;
