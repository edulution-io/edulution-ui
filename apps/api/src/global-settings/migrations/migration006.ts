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

/* eslint-disable no-underscore-dangle */
import { Logger } from '@nestjs/common';
import { move, pathExists, remove, readdir } from 'fs-extra';
import { join } from 'path';
import PUBLIC_ASSET_PATH from '@libs/common/constants/publicAssetPath';
import type { Migration } from '../../migration/migration.type';
import type { GlobalSettings, GlobalSettingsDocument } from '../global-settings.schema';

const OLD_LOGO_DIR = join(PUBLIC_ASSET_PATH, 'branding', 'logo');
const OLD_LOGO_FILE = 'main-logo-dark.webp';
const NEW_LOGO_DIR = join(PUBLIC_ASSET_PATH, 'generalsettings');
const NEW_LOGO_FILE = 'generalsettings-custom-logo.webp';

const migration006: Migration<GlobalSettingsDocument> = {
  name: '006-move-logo-to-generalsettings',
  version: 6,
  execute: async (model) => {
    const previousSchemaVersion = 7;
    const newSchemaVersion = 8;

    const globalSettings = await model
      .findOne({ schemaVersion: previousSchemaVersion })
      .lean<GlobalSettings & { _id: string }>()
      .exec();

    if (!globalSettings) {
      Logger.debug(
        'No global settings document found with previous schema version, skipping migration.',
        migration006.name,
      );
      return;
    }

    const oldLogoPath = join(OLD_LOGO_DIR, OLD_LOGO_FILE);
    const newLogoPath = join(NEW_LOGO_DIR, NEW_LOGO_FILE);

    if (await pathExists(oldLogoPath)) {
      if (await pathExists(newLogoPath)) {
        Logger.log('Custom logo already exists at new location, skipping move', migration006.name);
      } else {
        await move(oldLogoPath, newLogoPath);
        Logger.log(`Moved logo from ${oldLogoPath} to ${newLogoPath}`, migration006.name);
      }
    }

    if (await pathExists(OLD_LOGO_DIR)) {
      const files = await readdir(OLD_LOGO_DIR);
      if (files.length === 0) {
        await remove(OLD_LOGO_DIR);
        Logger.log('Removed empty branding/logo directory', migration006.name);
      }

      const brandingDir = join(PUBLIC_ASSET_PATH, 'branding');
      if (await pathExists(brandingDir)) {
        const brandingFiles = await readdir(brandingDir);
        if (brandingFiles.length === 0) {
          await remove(brandingDir);
          Logger.log('Removed empty branding directory', migration006.name);
        }
      }
    }

    const result = await model.updateOne({ _id: globalSettings._id }, { $set: { schemaVersion: newSchemaVersion } });

    Logger.log(`Migration 006 complete: ${result.modifiedCount} document updated.`, migration006.name);
  },
};

export default migration006;
