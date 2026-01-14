/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { Button } from '@/components/shared/Button';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';

const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <Button
    onClick={onDelete}
    className="absolute right-1 top-1 h-8 rounded-full bg-ciRed bg-opacity-70 p-2 hover:bg-ciRed"
  >
    <DeleteIcon className="text-text-ciRed h-4 w-4" />
  </Button>
);

export default DeleteButton;
