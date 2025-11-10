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
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import APPS from '@libs/appconfig/constants/apps';
import { DashboardIcon } from '@libs/assets';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { Migration } from '../../migration/migration.type';
import { AppConfig } from '../appconfig.schema';
import { GlobalSettings, GlobalSettingsSchema } from '../../global-settings/global-settings.schema';

const getImageUrl = (src: string) => `data:image/svg+xml,${encodeURIComponent(src)}`;

const migration005: Migration<AppConfig> = {
  name: '005-add-dashboard-app',
  version: 6,
  execute: async (model) => {
    const previousSchemaVersion = 5;
    const newSchemaVersion = 6;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion }).exec();
    if (unprocessedDocuments.length === 0) {
      return;
    }

    Logger.log(`${unprocessedDocuments?.length} documents to update...`);

    const GlobalSettingsModel = model.db.model<typeof GlobalSettingsSchema>(GlobalSettings.name);
    const globalSettings = await GlobalSettingsModel.findOne().exec();

    if (globalSettings?.general.deploymentTarget === DEPLOYMENT_TARGET.LINUXMUSTER) {
      const dashboardConfig = await model.exists({ name: APPS.DASHBOARD }).exec();
      Logger.debug(`Dashboard app exists: ${!!dashboardConfig}`, migration005.name);

      if (!dashboardConfig) {
        const filesharingConfig = await model.findOne({ name: APPS.FILE_SHARING }).exec();
        const filesharingAccessGroups = filesharingConfig?.accessGroups || [];

        const dashboardDoc = await model.create({
          name: APPS.DASHBOARD,
          translations: {},
          icon: getImageUrl(DashboardIcon),
          extendedOptions: {},
          appType: APP_INTEGRATION_VARIANT.NATIVE,
          options: {},
          accessGroups: filesharingAccessGroups,
          position: 1,
          schemaVersion: newSchemaVersion,
        });

        const positionUpdateResults = await model.updateMany(
          { _id: { $ne: dashboardDoc._id } },
          { $inc: { position: 1 } },
        );

        Logger.debug(`Update app position: ${positionUpdateResults.modifiedCount} documents updated`);
      }
    }

    const schemaUpdateResults = await model.updateMany(
      { schemaVersion: previousSchemaVersion },
      { $set: { schemaVersion: newSchemaVersion } },
    );

    Logger.log(`Migration completed: ${schemaUpdateResults.modifiedCount} documents updated`);
  },
};

export default migration005;
