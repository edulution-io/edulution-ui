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
import filterSegments from '@/pages/FileSharing/breadcrumb/filterSegments';
import useUserStore from '@/store/UserStore/UserStore';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/fileEditorStore';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';

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
  const homePath = `${user?.ldapGroups.role}s/${user?.username}`;
  const filteredSegments = filterSegments(segments);
  const { setShowEditor } = useFileEditorStore();
  const { setCurrentlyEditingFile } = useFileSharingStore();
  const handleSegmentClick = (index: number) => {
    const pathTo = `/${segments.slice(0, index + 3).join('/')}`;
    setShowEditor(false);
    setCurrentlyEditingFile(null);
    onNavigate(pathTo);
  };

  const getSegmentKey = (index: number) => segments.slice(0, index + 3).join('/');

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
              <span className="text-gray-500">{filteredSegments[filteredSegments.length - 1]}</span>
            </BreadcrumbItem>
          </>
        ) : (
          filteredSegments.map((segment, index) => (
            <React.Fragment key={getSegmentKey(index)}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === filteredSegments.length - 1 ? (
                  <span className="text-gray-500">{segment}</span>
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
