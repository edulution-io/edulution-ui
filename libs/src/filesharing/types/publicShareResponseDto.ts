import PublicShareDto from '@libs/filesharing/types/publicShareDto';

interface PublicShareResponseDto {
  success: boolean;
  status: number;
  requiresPassword?: boolean;
  deletedCount?: number;
  publicShare?: PublicShareDto | undefined;
}

export default PublicShareResponseDto;
