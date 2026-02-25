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

import AppConfigTable from '@libs/appconfig/types/appConfigTable';
import AiChatModelResponseDto from '@libs/aiChatModel/types/aiChatModelResponseDto';
import CreateAiChatModelDto from '@libs/aiChatModel/types/createAiChatModelDto';
import AiServiceCapabilityWithProficiency from '@libs/aiService/types/aiServiceCapabilityWithProficiency';

interface AiServiceOption {
  id: string;
  name: string;
  capabilities: AiServiceCapabilityWithProficiency[];
}

export interface AiChatModelTableStore extends AppConfigTable<AiChatModelResponseDto> {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewModel: (model: CreateAiChatModelDto) => Promise<void>;
  setSelectedModel: (model: AiChatModelResponseDto | null) => void;
  selectedModel: AiChatModelResponseDto | null;
  updateModel: (id: string, model: CreateAiChatModelDto) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  reset: () => void;
  isDeleteDialogOpen: boolean;
  isDeleteDialogLoading: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  error: null | Error;
  aiServiceOptions: AiServiceOption[];
  fetchAiServiceOptions: () => Promise<void>;
}
