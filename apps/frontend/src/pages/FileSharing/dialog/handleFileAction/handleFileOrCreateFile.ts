import FileActionType from '@libs/filesharing/types/fileActionType';
import { HttpMethods } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import eduApi from '@/api/eduApi';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';

const handleFileOrCreateFile = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  formData: FormData,
) => {
  if (action === FileActionType.UPLOAD_FILE || action === FileActionType.CREATE_FILE) {
    await eduApi[httpMethod](
      buildApiFileTypePathUrl(endpoint, type, getPathWithoutWebdav(formData.get('path') as string)),
      formData,
    );
  }
};

export default handleFileOrCreateFile;
