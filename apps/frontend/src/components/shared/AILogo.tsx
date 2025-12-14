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
import { SiAnthropic, SiGoogle, SiOpenai } from 'react-icons/si';
import { RiRobot2Fill } from 'react-icons/ri';
import cn from '@libs/common/utils/className';
import AIProvider from '@libs/chat/constants/aiProvider';
import { AIProviderType } from '@libs/chat/types/AIProviderType';

interface AILogoProps {
  provider?: AIProviderType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

const AILogo: React.FC<AILogoProps> = ({ provider, size = 'md', className }) => {
  const getProviderIcon = () => {
    const iconClass = iconSizeClasses[size];

    switch (provider) {
      case AIProvider.ANTHROPIC:
        return <SiAnthropic className={iconClass} />;
      case AIProvider.OPENAI:
        return <SiOpenai className={iconClass} />;
      case AIProvider.GOOGLE:
        return <SiGoogle className={iconClass} />;
      case AIProvider.OPENAI_COMPATIBLE:
      default:
        return <RiRobot2Fill className={iconClass} />;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-ciGreenToBlue text-background',
        sizeClasses[size],
        className,
      )}
    >
      {getProviderIcon()}
    </div>
  );
};

export default AILogo;
