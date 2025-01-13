import { ParsedMail } from 'mailparser';

interface MailDto extends Partial<ParsedMail> {
  id: number;
  flags?: Set<string>;
  labels?: Set<string>;
}

export default MailDto;
