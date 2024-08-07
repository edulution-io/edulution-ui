import { HttpMethods } from '@libs/common/types/http-methods';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import eduApi from '@/api/eduApi';
import buildApiFilePathUrl from '@libs/filesharing/utils/buildApiFilePathUrl';
import FileActionType from '@libs/filesharing/types/fileActionType';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';

const handleDeleteItems = async (data: PathChangeOrCreateProps[], endpoint: string, httpMethod: HttpMethods) => {
  const promises = data
    .map((item) => getPathWithoutWebdav(item.path))
    .filter((filename) => filename !== undefined)
    .map((filename) => eduApi[httpMethod](`${buildApiFilePathUrl(endpoint, filename)}`));

  return Promise.all(promises);
};

const handleArrayActions = async (data: PathChangeOrCreateProps[], endpoint: string, httpMethod: HttpMethods) => {
  const promises = data.map((item) => eduApi[httpMethod](buildApiFilePathUrl(endpoint, item.path), item));
  return Promise.all(promises);
};

const handleArrayData = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  data: PathChangeOrCreateProps[],
) => {
  if (action === FileActionType.DELETE_FILE_FOLDER) {
    await handleDeleteItems(data, endpoint, httpMethod);
  } else if (action === FileActionType.MOVE_FILE_FOLDER || action === FileActionType.RENAME_FILE_FOLDER) {
    await handleArrayActions(data, endpoint, httpMethod);
  }
};

export default handleArrayData;
