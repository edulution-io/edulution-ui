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

import VIDEO_EXTENSIONS from '@libs/filesharing/types/videoExtensions';
import VideoExtensionType from '@libs/filesharing/types/videoExtensionType';
import AudioExtensionsType from '@libs/filesharing/types/audioExtensionsType';
import AUDIO_EXTENSIONS from '@libs/filesharing/types/audioExtensions';

const isMediaExtension = (extension: string | undefined): boolean =>
  Object.values(VIDEO_EXTENSIONS).includes(extension as VideoExtensionType) ||
  Object.values(AUDIO_EXTENSIONS).includes(extension as AudioExtensionsType);

export default isMediaExtension;
