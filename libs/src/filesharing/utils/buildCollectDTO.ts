import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import buildCollectPath from '@libs/filesharing/utils/buildCollectPath';

const buildCollectDTO = (
  students: UserLmnInfo[] | null,
  currentUser: UserLmnInfo | null,
  currentGroupName: string,
  homePath: string,
): CollectFileRequestDTO[] | undefined => {
  if (!students) return undefined;
  if (!currentUser) return undefined;

  return students.map((student) => buildCollectPath(currentUser.cn, homePath, currentGroupName, student));
};

export default buildCollectDTO;
