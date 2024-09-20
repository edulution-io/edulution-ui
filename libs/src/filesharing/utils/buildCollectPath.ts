import buildUserPath from '@libs/filesharing/utils/buildUserPath';
import buildNewCollectFolderName from '@libs/filesharing/utils/buildNewCollectFolderName';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import FILE_PATHS from '../constants/file-paths';

const buildCollectPath = (
  username: string,
  role: string,
  schoolClass: string,
  student: UserLmnInfo,
): CollectFileRequestDTO => {
  const basePathForCurrentUser = buildUserPath(role, schoolClass, username);
  const basePathForStudent = buildUserPath(student.sophomorixRole, student.schoolclasses[0], student.cn);

  const newFolderName = buildNewCollectFolderName(schoolClass);

  const destinationPath = `${basePathForCurrentUser}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}/${newFolderName}/${student.cn}/${FILE_PATHS.COLLECT}/`;
  const originPath = `${basePathForStudent}/${FILE_PATHS.TRANSFER}/${username}/${FILE_PATHS.COLLECT}/`;

  return {
    destinationPath,
    originPath,
    userName: student.cn,
    newFolderName,
  };
};

export default buildCollectPath;
