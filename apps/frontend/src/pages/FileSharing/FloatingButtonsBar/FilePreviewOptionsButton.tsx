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

import React, { FC, ReactNode } from 'react';
import { Button } from '@/components/shared/Button';

interface FilePreviewButtonsProps {
  onClick: () => void;
  icon?: ReactNode;
}

const FilePreviewOptionsButton: FC<FilePreviewButtonsProps> = ({ onClick, icon }) => (
  <Button
    variant="btn-small"
    className="hover:bg-grey-700 rounded bg-secondary p-1 text-background"
    onClick={onClick}
  >
    {icon && <span className="inline text-foreground">{icon}</span>}
  </Button>
);

export default FilePreviewOptionsButton;
