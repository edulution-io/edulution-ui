import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';

type CreateWorkingDirectoryDto = {
  teacher: string;
  schoolClass: LmnApiSchoolClass;
};

export default CreateWorkingDirectoryDto;
