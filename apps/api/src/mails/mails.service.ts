import MailProviderConfigDto from '@libs/mails/types/mailProviderConfig.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CustomHttpException from '@libs/error/CustomHttpException';
import ErrorMessage from '@libs/error/errorMessage';
import { MailProvider, MailProviderDocument } from './mail-provider.schema';

@Injectable()
class MailsService {
  constructor(@InjectModel(MailProvider.name) private mailProviderModel: Model<MailProviderDocument>) {}

  async getExternalMailProviderConfig(): Promise<MailProviderConfigDto[]> {
    const mailProvidersList = await this.mailProviderModel.find({}, 'mailProviderId name label host port secure');

    if (!mailProvidersList) {
      throw new CustomHttpException('Mail providers not found' as ErrorMessage, HttpStatus.NOT_FOUND);
    }

    const mailProviders: MailProviderConfigDto[] = mailProvidersList.map((item) => ({
      id: item.mailProviderId,
      name: item.name,
      label: item.label,
      host: item.host,
      port: item.port,
      secure: item.secure,
    }));

    return mailProviders;
  }
}

export default MailsService;
