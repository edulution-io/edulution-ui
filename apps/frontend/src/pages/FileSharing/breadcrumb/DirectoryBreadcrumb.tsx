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
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useUserPath from '../hooks/useUserPath';

interface DirectoryBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  style?: React.CSSProperties;
}

const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({ path, onNavigate, style }) => {
  const isMobileView = useIsMobileView();
  const displaySegments = isMobileView ? 1 : 4;
  const { t } = useTranslation();
  const { homePath } = useUserPath();
  const { setShowEditor } = useFileEditorStore();
  const { setCurrentlyEditingFile } = useFileSharingStore();

  const segments = path
    .split('/')
    .map((segment) => segment.replace(/%20/g, ' '))
    .filter(Boolean);
  const getSegmentKey = (index: number) => segments.slice(0, index + 1).join('/');

  const handleSegmentClick = (index: number) => {
    setShowEditor(false);
    setCurrentlyEditingFile(null);
    onNavigate(getSegmentKey(index));
  };

  return (
    <Breadcrumb style={style}>
      <p className="mr-2 text-background">{t('currentDirectory')}</p>
      <BreadcrumbList>
        <BreadcrumbItem key="home">
          <BreadcrumbLink
            href="#"
            onClick={() => onNavigate(homePath)}
          >
            {t('home')}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.length > displaySegments ? (
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
                  className="z-50 bg-background text-foreground"
                >
                  {segments.slice(0, -1).map((segment, index) => (
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
              <span className="text-ciGrey">{segments[segments.length - 1]}</span>
            </BreadcrumbItem>
          </>
        ) : (
          segments.map((segment, index) => (
            <React.Fragment key={getSegmentKey(index)}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === segments.length - 1 ? (
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
