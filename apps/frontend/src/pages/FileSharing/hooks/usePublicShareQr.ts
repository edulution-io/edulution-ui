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

import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import usePublicShareStore from '../publicShare/usePublicShareStore';

const usePublicShareQr = () => {
  const { share, setShare, closeDialog, dialog } = usePublicShareStore();
  const { origin } = window.location;
  const url = share?.publicShareId ? `${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${share.publicShareId}` : '';

  const handleClose = () => {
    setShare({} as PublicShareDto);
    closeDialog(PUBLIC_SHARE_DIALOG_NAMES.QR_CODE);
  };

  return { share, dialog, url, handleClose };
};

export default usePublicShareQr;
