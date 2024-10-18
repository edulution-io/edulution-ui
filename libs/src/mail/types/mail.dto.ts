import { ParsedMail } from 'mailparser';

interface MailDto extends ParsedMail {
  id: number;
  flags?: Set<string>;
  labels?: Set<string>;
}

export default MailDto;
