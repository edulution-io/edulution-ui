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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import CircleLoader from '@/components/ui/CircleLoader';

interface LoadingIndicatorProps {
  isOpen: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen }) => (
  <Dialog open={isOpen}>
    <DialogContent
      showCloseButton={false}
      variant="loadingSpinner"
    >
      <DialogTitle aria-disabled />
      <DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          <CircleLoader />
        </div>
      </DialogHeader>
      <DialogDescription aria-disabled />
    </DialogContent>
  </Dialog>
);

export default LoadingIndicator;
