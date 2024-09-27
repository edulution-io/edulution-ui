import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import FILE_PATHS from '../constants/file-paths';

const buildSharePath = (userName: string, fileName: string, student: UserLmnInfo): string => {
  const file = fileName.split('/').pop();

  return `${student.sophomorixIntrinsic2[0]}/${FILE_PATHS.TRANSFER}/${userName}/${file}`;
};

export default buildSharePath;
