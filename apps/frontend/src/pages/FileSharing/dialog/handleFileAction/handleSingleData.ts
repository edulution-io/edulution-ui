import FileActionType from '@libs/filesharing/types/fileActionType';
import { HttpMethodes } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import eduApi from '@/api/eduApi';
import buildApiFilePathUrl from '@libs/filesharing/utils/buildApiFilePathUrl';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import buildApiFileDownload from '@libs/filesharing/utils/buildApiFileDownload';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import ValidTime from '@libs/filesharing/types/validTime';

const handleSingleData = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethodes,
  type: ContentType,
  data: PathChangeOrCreateProps,
  selectedValidLinkTime?: ValidTime,
) => {
  if (action === FileActionType.CREATE_FOLDER) {
    return eduApi[httpMethod](buildApiFileTypePathUrl(endpoint, type, data.path), data);
  }
  if (action === FileActionType.MOVE_FILE_FOLDER || action === FileActionType.RENAME_FILE_FOLDER) {
    return eduApi[httpMethod](buildApiFilePathUrl(endpoint, data.path), data);
  }
  if (action === FileActionType.SHARABLE_LINK) {
    if (!selectedValidLinkTime) {
      return undefined;
    }
    return eduApi[httpMethod]<WebdavStatusReplay>(
      buildApiFileDownload(endpoint, data.path, data.newPath, selectedValidLinkTime),
    );
  }
  return undefined;
};

export default handleSingleData;
