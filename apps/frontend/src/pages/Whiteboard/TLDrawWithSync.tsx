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

import React, { useMemo } from 'react';
import type { TLAssetStore } from 'tldraw';
import { Tldraw } from 'tldraw';
import { useSync } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import COLOR_SCHEME from '@libs/ui/constants/colorScheme';

type Props = {
  uri: string;
  userLanguage: string;
  userName: string;
};

const TldrawWithSync = ({ uri, userLanguage, userName }: Props) => {
  const assetStore = useMemo<TLAssetStore>(
    () => ({
      upload() {
        throw new Error('Asset uploads are disabled.');
      },
      resolve(asset) {
        return asset.props.src;
      },
    }),
    [],
  );

  const store = useSync({ uri, assets: assetStore });

  return (
    <Tldraw
      onMount={(editor) => {
        editor.user.updateUserPreferences({
          colorScheme: COLOR_SCHEME,
          locale: userLanguage,
          name: userName,
        });
      }}
      store={store}
      overrides={{
        actions(_editor, actions) {
          // eslint-disable-next-line no-param-reassign
          delete actions['insert-media'];
          return actions;
        },
        tools(_editor, tools) {
          // eslint-disable-next-line no-param-reassign
          delete tools.asset;
          return tools;
        },
      }}
    />
  );
};

export default TldrawWithSync;
