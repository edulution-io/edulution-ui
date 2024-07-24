import { ParsedMail } from 'mailparser';

interface MailDto extends ParsedMail {
  flags?: Set<string>;
  labels?: Set<string>;
}

export default MailDto;
