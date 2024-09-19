import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';
import useIsMobileView from '@/hooks/useIsMobileView';
import { HiChevronDown } from 'react-icons/hi';
import useLmnApiStore from '@/store/useLmnApiStore';
import filterSegments from '@/pages/FileSharing/breadcrumb/filterSegments';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import buildHomePath from '@libs/filesharing/utils/buildHomePath';
import buildBasePath from '@libs/filesharing/utils/buildBasePath';
import useUserStore from '@/store/UserStore/UserStore';

interface DirectoryBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  style?: React.CSSProperties;
}

const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({ path, onNavigate, style }) => {
  const segments = path
    .split('/')
    .map((segment) => segment.replace(/%20/g, ' '))
    .filter(Boolean);

  const isMobileView = useIsMobileView();
  const displaySegments = isMobileView ? 1 : 4;
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { user: lmnUser } = useLmnApiStore();
  const schoolClass = lmnUser?.schoolclasses[0] || '';
  const userRole = user?.ldapGroups?.roles[0] || '';
  const homePath = buildHomePath(user, schoolClass);
  const filteredSegments = filterSegments(segments, schoolClass);
  const { setShowEditor } = useFileEditorStore();
  const { setCurrentlyEditingFile } = useFileSharingStore();

  const handleSegmentClick = (index: number) => {
    const pathTo = `/${filteredSegments.slice(0, index + 1).join('/')}`;
    setShowEditor(false);
    setCurrentlyEditingFile(null);
    const basePath = buildBasePath(userRole, schoolClass);
    const finalPath = `${basePath}${pathTo}`;
    onNavigate(finalPath);
  };
  const getSegmentKey = (index: number) => filteredSegments.slice(0, index + 1).join('/');

  return (
    <Breadcrumb style={style}>
      <p className="mr-2 text-white">{t('currentDirectory')}</p>
      <BreadcrumbList>
        <BreadcrumbItem key="home">
          <BreadcrumbLink
            href="#"
            onClick={() => onNavigate(homePath)}
          >
            {t('home')}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {filteredSegments.length > displaySegments ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenuSH>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  ...
                  <HiChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="z-50 bg-white text-foreground"
                >
                  {filteredSegments.slice(0, -1).map((segment, index) => (
                    <DropdownMenuItem
                      key={getSegmentKey(index)}
                      onClick={() => handleSegmentClick(index)}
                    >
                      {segment}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenuSH>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-ciGrey">{filteredSegments[filteredSegments.length - 1]}</span>
            </BreadcrumbItem>
          </>
        ) : (
          filteredSegments.map((segment, index) => (
            <React.Fragment key={getSegmentKey(index)}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === filteredSegments.length - 1 ? (
                  <span className="text-ciGrey">{segment}</span>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={() => handleSegmentClick(index)}
                  >
                    {segment}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DirectoryBreadcrumb;
