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
import { ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface DownloadPublicProps {
  onClick: () => void;
  label: string;
  isLoading?: boolean;
}

const DownloadPublic: React.FC<DownloadPublicProps> = ({ onClick, label, isLoading }) => (
  <Button
    onClick={onClick}
    variant="btn-security"
    disabled={isLoading}
    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl"
  >
    <ArrowDownToLine className="h-5 w-5" />
    {label}
  </Button>
);

export default DownloadPublic;
