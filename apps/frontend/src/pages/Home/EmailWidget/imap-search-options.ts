export enum ImapSearchParameter {
  ALL = 'ALL', // return all messages that fit to the other criteria
  ANSWERED = 'ANSWERED', // returns all messages with the flag \\ANSWERED
  BCC = 'BCC', // BCC "text" -> returns messages with substring "text" in the Bcc:-field
  BEFORE = 'BEFORE', // BEFORE "date" -> returns all messages that were send before the "date"
  BODY = 'BODY', // BODY "text" -> returns all messages with the substring "text" in the body of the mail
  CC = 'CC', // CC "text" -> returns messages with substring "text" in the Cc:-field
  DELETED = 'DELETED', // returns all messages marked as to be deleted
  FLAGGED = 'FLAGGED', // returns all messages with the flag \\FLAGGED (important/urgent)
  FROM = 'FROM', // returns messages with substring "text" in the From:-field
  KEYWORD = 'KEYWORD', // KEYWORD "text" - returns all messages with the substring "text" in the keyword
  NEW = 'NEW', // returns all new messages
  OLD = 'OLD', // returns all old messages
  ON = 'ON', //  ON "datum" -> returns all messages that were send on the specific "date"
  RECENT = 'RECENT', // returns all messages with the flag \\RECENT
  SEEN = 'SEEN', // returns messages that were read were the flag \\SEEN is set
  SINCE = 'SINCE', // SINCE "date" -> returns all messages that were send after/since the "date"
  SUBJECT = 'SUBJECT', // SUBJECT "text" -> returns messages with substring "text" in the Subject:-field
  TEXT = 'TEXT', // TEXT "text" -> returns messages with substring "text" in the text
  TO = 'TO', // TO "text" -> returns messages with substring "text" in the To:-field
  UNANSWERED = 'UNANSWERED', // returns messages that were not answered yet
  UNDELETED = 'UNDELETED', // returns all messages that are not marked as to be deleted
  UNFLAGGED = 'UNFLAGGED', // returns all messages were the flag \\FLAGGED is not set (-> not marked as important/urgent)
  UNKEYWORD = 'UNKEYWORD', // UNKEYWORD "text" -> returns all messages which keywords do not contain "text"
  UNSEEN = 'UNSEEN', // return all messages that are not marked as read
}

export type ImapSimpleParameters =
  | 'ALL'
  | 'ANSWERED'
  | 'DELETED'
  | 'FLAGGED'
  | 'NEW'
  | 'OLD'
  | 'RECENT'
  | 'SEEN'
  | 'UNANSWERED'
  | 'UNDELETED'
  | 'UNFLAGGED'
  | 'UNSEEN';

export type ImapSimpleParameter = {
  option: ImapSimpleParameters;
};

export type ImapTextParameters = 'BCC' | 'BODY' | 'CC' | 'FROM' | 'KEYWORD' | 'SUBJECT' | 'TEXT' | 'TO' | 'UNKEYWORD';

export type ImapTextParameter = {
  option: ImapTextParameters;
  text: string;
};

export type ImapDateParameters = 'BEFORE' | 'ON' | 'SINCE';

export type ImapDateParameter = {
  option: ImapDateParameters;
  date: Date | string;
};

export type ImapSearchOption = ImapSimpleParameter | ImapTextParameter | ImapDateParameter;
