import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import usePublicShareStore from '../publicShare/usePublicShareStore';

const usePublicShareQr = () => {
  const { share, setShare, closeDialog, dialog } = usePublicShareStore();
  const {origin} = window.location;
  const url = share?.publicShareId ? `${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${share.publicShareId}` : '';

  const handleClose = () => {
    setShare({} as PublicShareDto);
    closeDialog(PUBLIC_SHARE_DIALOG_NAMES.QR_CODE);
  };

  return { share, dialog, url, handleClose };
};

export default usePublicShareQr;
