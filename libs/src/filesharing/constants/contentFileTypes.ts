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

const CONTENT_FILE_TYPES = {
  '.aac': 'audio',
  '.mp3': 'audio',
  '.abw': 'document',
  '.arc': 'compressed',
  '.zip': 'compressed',
  '.3gp': 'video',
  '.mp4': 'video',
  '.mov': 'video',
  '.3g2': 'video',
  '.webm': 'video',
  '.7z': 'compressed',
  '.pdf': 'acrobat',
  '.doc': 'document',
  '.docx': 'document',
  '.ppt': 'presentation',
  '.pptx': 'presentation',
  '.xls': 'spreadsheet',
  '.xlsx': 'spreadsheet',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.webp': 'image',
  '.svg': 'vector',
  '.js': 'code',
  '.java': 'code',
  '.py': 'code',
  '.cpp': 'code',
  '.drawio': 'vector',
} as const;

export default CONTENT_FILE_TYPES;
