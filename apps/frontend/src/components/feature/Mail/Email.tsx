import React from 'react';
import { useTranslation } from 'react-i18next';
// import { AddressObject, Attachment, HeaderLines, Headers } from 'mailparser';
import renderParameter from './Parameter';

interface MailProps {
  emailIndex: string;
  // attachments?: Attachment[];
  // headers?: Headers;
  // headerLines?: HeaderLines;
  // html?: string | false;
  text?: string | undefined;
  // textAsHtml?: string | undefined;
  // subject?: string | undefined;
  // references?: string[] | string | undefined;
  // date?: Date | undefined;
  // to?: AddressObject | AddressObject[] | undefined;
  // from?: AddressObject | undefined;
  // cc?: AddressObject | AddressObject[] | undefined;
  // bcc?: AddressObject | AddressObject[] | undefined;
  // replyTo?: AddressObject | undefined;
  // messageId?: string | undefined;
  // inReplyTo?: string | undefined;
  // priority?: "normal" | "low" | "high" | undefined;
}

const Email = (props: MailProps) => {
  const {
    text,
    emailIndex,
    // messageId,
  } = props;

  const { t } = useTranslation();

  const classNameSection = 'text-gray-900 mt-2';
  const classNameInput = 'text-sm text-gray-500 p-2';

  // const keys = ['from', 'cc', 'bcc', 'subject', 'date'] as Array<keyof MailProps>;

  const keys = ['text'] as Array<keyof MailProps>;

  return (
    <div
      key={`EmailWidget_-_Email_${emailIndex}`}
      className="mb-4 rounded border bg-gray-100 p-2 shadow"
    >
      <h4 className="text-gray-900">{`${t('email')}: ${emailIndex}`}</h4>
      {
        // eslint-disable-next-line react/destructuring-assignment
        keys.map((key) => renderParameter(key, props[key]))
      }
      <div className={classNameSection}>
        <input
          className={classNameInput}
          type="text"
          value={`${JSON.stringify(text, null, 2)}`}
          readOnly
        />
      </div>
    </div>
  );
};

export default Email;
