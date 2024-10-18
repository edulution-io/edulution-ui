import FileActionType from '@libs/filesharing/types/fileActionType';
import { HttpMethods } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import eduApi from '@/api/eduApi';
import buildApiFilePathUrl from '@libs/filesharing/utils/buildApiFilePathUrl';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';

const handleSingleData = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  data: PathChangeOrCreateProps,
) => {
  if (action === FileActionType.CREATE_FOLDER) {
    await eduApi[httpMethod](buildApiFileTypePathUrl(endpoint, type, data.path), data);
  } else if (action === FileActionType.MOVE_FILE_FOLDER || action === FileActionType.RENAME_FILE_FOLDER) {
    await eduApi[httpMethod](buildApiFilePathUrl(endpoint, data.path), data);
  }
};

export default handleSingleData;
