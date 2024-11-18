import { TAppConfigSectionGeneral } from '@libs/appconfig/types/tAppConfigSectionGeneral';
import { TAppConfigSectionIMAP } from '@libs/appconfig/types/tAppConfigSectionIMAP';
import { TAppConfigSectionOnlyOffice } from '@libs/appconfig/types/tAppConfigSectionOnlyOffice';

export type TAppFieldName = TAppConfigSectionGeneral | TAppConfigSectionIMAP | TAppConfigSectionOnlyOffice;
