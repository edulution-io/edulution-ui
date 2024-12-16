import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { useTranslation } from 'react-i18next';
import { HiChevronDown } from 'react-icons/hi';
import DropdownMenu from '@/components/shared/DropdownMenu';
import useIsMobileView from '@/hooks/useIsMobileView';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useUserPath from '../hooks/useUserPath';

interface DirectoryBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  style?: React.CSSProperties;
  showHome?: boolean;
  hiddenSegments?: string[];
}

const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({
  path,
  showHome = true,
  hiddenSegments,
  onNavigate,
  style,
}) => {
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

  const clearSegments = segments.filter((segment) => hiddenSegments?.includes(segment) !== true);

  const getSegmentKey = (index: number) => segments.slice(0, index + 1).join('/');

  const handleSegmentClick = (index: number) => {
    setShowEditor(false);
    setCurrentlyEditingFile(null);

    const newPath = getSegmentKey(index);
    if (newPath !== path) {
      onNavigate(newPath);
    }
  };

  const shouldShowDropdown = clearSegments.length > displaySegments;

  return (
    <Breadcrumb style={style}>
      <p className="mr-2 text-background">{t('currentDirectory')}</p>
      <BreadcrumbList>
        {showHome && (
          <BreadcrumbItem key="home">
            <BreadcrumbLink
              href="#"
              onClick={() => onNavigate(homePath)}
            >
              {t('home')}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {shouldShowDropdown ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu
                trigger={
                  <span className="flex cursor-pointer items-center gap-1">
                    ...
                    <HiChevronDown />
                  </span>
                }
                items={segments
                  .slice(0, -1)
                  .filter((segment) => clearSegments.includes(segment))
                  .map((segment, index) => ({
                    label: segment,
                    onClick: () => handleSegmentClick(index),
                  }))}
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-ciGrey">{segments[segments.length - 1]}</span>
            </BreadcrumbItem>
          </>
        ) : (
          segments.map(
            (segment, index) =>
              clearSegments.includes(segment) && (
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
              ),
          )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DirectoryBreadcrumb;
