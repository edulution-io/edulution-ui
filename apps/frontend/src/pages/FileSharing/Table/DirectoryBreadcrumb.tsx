/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
import useMedia from '@/hooks/useMedia';

interface DirectoryBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  style?: React.CSSProperties;
  showHome?: boolean;
  hiddenSegments?: string[];
  showTitle?: boolean;
}

const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({
  path,
  showHome = true,
  hiddenSegments,
  onNavigate,
  style,
  showTitle = true,
}) => {
  const { isMobileView } = useMedia();
  const displaySegments = isMobileView ? 1 : 4;
  const { t } = useTranslation();

  const segments = path
    .split('/')
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .filter(Boolean);

  const clearSegments = segments.filter((segment) => hiddenSegments?.includes(segment) !== true);

  const getSegmentKey = (index: number) => {
    const key = segments.slice(0, index + 1).join('/');
    return key.startsWith('/') ? key : `/${key}`;
  };

  const handleSegmentClick = (index: number) => {
    const newPath = getSegmentKey(index);
    if (newPath !== path) {
      onNavigate(newPath);
    }
  };
  const shouldShowDropdown = clearSegments.length > displaySegments;

  return (
    <Breadcrumb style={style}>
      {showTitle && <p className="mr-2 text-background">{t('currentDirectory')}</p>}
      <BreadcrumbList>
        {showHome && (
          <BreadcrumbItem key="home">
            <BreadcrumbLink onClick={() => onNavigate('/')}>{t('home')}</BreadcrumbLink>
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
              <span className="text-background">{segments[segments.length - 1]}</span>
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
                      <span className="text-background">{segment}</span>
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
