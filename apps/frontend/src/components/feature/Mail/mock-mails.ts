import { HeaderValue, ParsedMail } from "mailparser";

const mockMails: ParsedMail[] = [
  {
    attachments: [],
    html: "<>{ 'Body of the first message' }</>",
    text: "Body of the first message",
    subject: "Subject of the first message",
    date: new Date(),
    priority: "normal",
    headers: new Map<string, HeaderValue>(),
    headerLines: [
      {key:"text1", line:"0"},
    ],
  },
  {
    attachments: [],
    headers: new Map<string, HeaderValue>(),
    headerLines: [
      {key:"text2", line:"0"},
    ],
    html: "<>{ 'Body of the second message' }</>",
    text: "Body of the second message",
    subject: "Subject of the second message",
    date: new Date(),
    priority: "low",
  },
  {
    attachments: [],
    headers: new Map<string, HeaderValue>(),
    headerLines: [
      {key:"text3", line:"0"},
    ],
    html: "<>{ 'Body of the third message' }</>",
    text: "Body of the third message",
    subject: "Subject of the third message",
    date: new Date(),
    priority: "high",
  }
]

export default mockMails;
