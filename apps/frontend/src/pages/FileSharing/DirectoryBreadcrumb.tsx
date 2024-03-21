import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import useMediaQuery from '@/hooks/media/useMediaQuery';

interface DirectoryBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({ path, onNavigate }) => {
  const segments = path.split('/').filter(Boolean);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const displaySegments = isMobile ? 1 : 4;
  const handleSegmentClick = (segment: string) => {
    const pathTo = `/${segments.slice(0, segments.indexOf(segment) + 1).join('/')}`;
    onNavigate(pathTo);
  };

  return (
    <Breadcrumb className="mr-2 text-white">
      Current Directory:
      <BreadcrumbList>
        <BreadcrumbItem key="home">
          <BreadcrumbLink
            href="#"
            onClick={() => onNavigate('/')}
          >
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.length > displaySegments ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  ...
                  <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="text-black"
                >
                  {segments.slice(0, -1).map((segment, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleSegmentClick(segment)}
                    >
                      {segment}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-gray-500">{segments[segments.length - 1]}</span>
            </BreadcrumbItem>
          </>
        ) : (
          segments.map((segment, index) => (
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
