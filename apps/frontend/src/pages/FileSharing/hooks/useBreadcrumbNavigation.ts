import APPS from '@libs/appconfig/constants/apps';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useVariableSharePathname from './useVariableSharePathname';

const useBreadcrumbNavigation = (
  webdavShare: string | undefined,
  webdavShares: WebdavShareDto[],
  searchParams: URLSearchParams,
  setSearchParams: (params: URLSearchParams) => void,
) => {
  const navigate = useNavigate();
  const { createVariableSharePathname } = useVariableSharePathname();

  const currentShare = useMemo(
    () => webdavShares.find((s) => s.displayName === webdavShare),
    [webdavShare, webdavShares],
  );

  const hiddenSegments = currentShare?.pathname;

  const handleBreadcrumbNavigate = (filenamePath: string) => {
    if (!currentShare) return;

    if (filenamePath === '/') {
      let currentSharePath = currentShare.pathname;
      if (currentShare.pathVariables) {
        currentSharePath = createVariableSharePathname(currentSharePath, currentShare.pathVariables);
      }

      navigate(
        {
          pathname: `/${APPS.FILE_SHARING}/${currentShare.displayName}`,
          search: `?${URL_SEARCH_PARAMS.PATH}=${encodeURIComponent(currentSharePath)}`,
        },
        { replace: true },
      );
      return;
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set(URL_SEARCH_PARAMS.PATH, filenamePath);
    setSearchParams(newParams);
  };

  return { handleBreadcrumbNavigate, hiddenSegments };
};

export default useBreadcrumbNavigation;
