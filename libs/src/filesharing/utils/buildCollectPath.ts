import buildBasePath from '@libs/filesharing/utils/buildBasePath';
import buildNewCollectFolderName from '@libs/filesharing/utils/buildNewCollectFolderName';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';

const buildCollectPath = (
  username: string,
  role: string,
  schoolclass: string,
  student: UserLmnInfo,
): CollectFileRequestDTO => {
  const basePathForCurrentUser = buildBasePath(role, schoolclass);
  const buildPathForStudent = buildBasePath(student.sophomorixRole, student.schoolclasses[0]);
  const newFolderName = buildNewCollectFolderName(schoolclass);
  const destinationPath = `${basePathForCurrentUser}/${username}/transfer/collected/${newFolderName}/${student.cn}/_collect/`;
  const srcPath = `${buildPathForStudent}/${student.cn}/transfer/${username}/_collect/`;

  return {
    destinationPath,
    originPath: srcPath,
    userName: student.cn,
    newFolderName,
  };
};

export default buildCollectPath;
