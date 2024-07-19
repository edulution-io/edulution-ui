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
  const homePath = `${user?.ldapGroups.role}s/${user?.name}`;
  const filteredSegment = filterSegments(segments);

  const handleSegmentClick = (segment: string) => {
    const pathTo = `/${segments.slice(0, segments.indexOf(segment) + 1).join('/')}`;
    onNavigate(pathTo);
  };

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

        {filteredSegment.length > displaySegments ? (
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
                  {filterSegments(segments)
                    .slice(0, -1)
                    .map((segment) => (
                      <DropdownMenuItem
                        key={segment}
                        onClick={() => handleSegmentClick(segment)}
                      >
                        {segment}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenuSH>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-gray-500">{segments[segments.length - 1]}</span>
            </BreadcrumbItem>
          </>
        ) : (
          filteredSegment.map((segment, index) => (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === segments.length - 1 ? (
                  <span className="text-gray-500">{segment}</span>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={() => handleSegmentClick(segment)}
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
