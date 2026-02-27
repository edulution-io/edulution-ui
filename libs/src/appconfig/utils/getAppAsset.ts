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

import ThemeType from '@libs/common/types/themeType';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import AssetType from '@libs/appconfig/types/assetType';

export const getAssetName = (appName: string, assetType: AssetType, theme?: ThemeType) =>
  theme ? `${appName}-custom-${assetType}-${theme}.webp` : `${appName}-custom-${assetType}.webp`;

export const getFallbackAssetName = (appName: string, assetType: AssetType, theme?: ThemeType) =>
  theme ? `${appName}-default-${assetType}-${theme}.webp` : `${appName}-default-${assetType}.webp`;

export const getAssetUrl = (appName: string, assetType: AssetType, theme?: ThemeType) =>
  `/${EDU_API_ROOT}/${EDU_API_CONFIG_ENDPOINTS.FILES}/public/assets/${appName}/${getAssetName(appName, assetType, theme)}?fallback=${getFallbackAssetName(appName, assetType, theme)}`;

/*
{
  "title": "All Question Types",
  "logo": "/edu-api/files/public/assets/surveys/surveys-custom-logo-light.webp?fallback=surveys-default-logo-light.webp"
  "pages": [
    {
      "name": "Seite1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "Frage1",
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        },
        {
          "type": "rating",
          "name": "Frage2"
        },
        {
          "type": "checkbox",
          "name": "Frage3",
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        },
        {
          "type": "dropdown",
          "name": "Frage4",
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        },
        {
          "type": "boolean",
          "name": "Frage5"
        },
        {
          "type": "file",
          "name": "Frage6"
        },
        {
          "type": "imagepicker",
          "name": "Frage7",
          "choices": [
            {
              "value": "Image 1",
              "imageLink": "https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg"
            },
            {
              "value": "Image 2",
              "imageLink": "https://surveyjs.io/Content/Images/examples/image-picker/giraffe.jpg"
            },
            {
              "value": "Image 3",
              "imageLink": "https://surveyjs.io/Content/Images/examples/image-picker/panda.jpg"
            },
            {
              "value": "Image 4",
              "imageLink": "https://surveyjs.io/Content/Images/examples/image-picker/camel.jpg"
            }
          ],
          "imageFit": "cover"
        },
        {
          "type": "ranking",
          "name": "Frage8",
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        },
        {
          "type": "text",
          "name": "Frage9"
        },
        {
          "type": "text",
          "name": "Frage10",
          "inputType": "color"
        },
        {
          "type": "comment",
          "name": "Frage11"
        },
        {
          "type": "multipletext",
          "name": "Frage12",
          "items": [
            {
              "name": "Text1"
            },
            {
              "name": "Text2"
            }
          ]
        },
        {
          "type": "panel",
          "name": "Frage13"
        },
        {
          "type": "paneldynamic",
          "name": "Frage14"
        },
        {
          "type": "matrix",
          "name": "Frage15",
          "columns": [
            "Spalte 1",
            "Spalte 2",
            "Spalte 3"
          ],
          "rows": [
            "Zeile 1",
            "Zeile 2"
          ]
        },
        {
          "type": "matrixdropdown",
          "name": "Frage16",
          "columns": [
            {
              "name": "Spalte 1"
            },
            {
              "name": "Spalte 2"
            },
            {
              "name": "Spalte 3"
            }
          ],
          "choices": [
            1,
            2,
            3,
            4,
            5
          ],
          "rows": [
            "Zeile 1",
            "Zeile 2"
          ]
        },
        {
          "type": "image",
          "name": "Frage17",
          "imageFit": "cover",
          "imageHeight": "auto",
          "imageWidth": "100%"
        },
        {
          "type": "signaturepad",
          "name": "Frage18"
        }
      ]
    }
  ]
}

*/
