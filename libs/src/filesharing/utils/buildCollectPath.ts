import buildNewCollectFolderName from '@libs/filesharing/utils/buildNewCollectFolderName';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import FILE_PATHS from '../constants/file-paths';

const buildCollectPath = (
  username: string,
  homePath: string,
  schoolClass: string,
  student: UserLmnInfo,
): CollectFileRequestDTO => {
  const newFolderName = buildNewCollectFolderName(schoolClass);

  const destinationPath = `${homePath}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}/${newFolderName}/${student.cn}/${FILE_PATHS.COLLECT}/`;
  const originPath = `${student.sophomorixIntrinsic2[0]}/${FILE_PATHS.TRANSFER}/${username}/${FILE_PATHS.COLLECT}/`;

  return {
    destinationPath,
    originPath,
    userName: student.cn,
    newFolderName,
  };
};

export default buildCollectPath;
