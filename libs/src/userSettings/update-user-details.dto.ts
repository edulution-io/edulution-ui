interface UpdateUserDetailsDto {
  givenName: string;
  displayName: string;
  mailalias: boolean;
  name: string;
  proxyAddresses: string[];
  sn: string;
  sophomorixCustom1: string;
  sophomorixCustom2: string;
  sophomorixCustom3: string;
  sophomorixCustom4: string;
  sophomorixCustom5: string;
  sophomorixCustomMulti1: string[];
  sophomorixCustomMulti2: string[];
  sophomorixCustomMulti3: string[];
  sophomorixCustomMulti4: string[];
  sophomorixCustomMulti5: string[];
  thumbnailPhoto: string;
}

export default UpdateUserDetailsDto;
