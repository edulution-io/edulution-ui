import { ImapSearchParameter, ImapSearchOption } from '@/components/feature/Mail/imap-search-options';

export interface ImapSearchCriteriaParameter {
  options: ImapSearchOption[];
}
export const getImapSearchCriteria = (props: ImapSearchCriteriaParameter) => {
  const { options } = props;

  // this code will ONLY respect the FIRST entry of a parameter for each specific keyword (NOT MULTIPLE!)
  const imapSearchCriteria: string = '';

  // TODO: test if the order is arbitrary or not
  // we iterate over all possible keywords since the order of the parameter could be important
  // if the order is not important this should be loop over the options
  const ImapParameter = Object.keys(ImapSearchParameter);
  ImapParameter.forEach((key) => {
    const object = options.find((option) => option.option === key);
    if (!object) {
      return;
    }
    if ('date' in object) {
      imapSearchCriteria.concat(`[ ${object.option}, ${object.date.toString()} ],`);
      return;
    }
    if ('text' in object) {
      imapSearchCriteria.concat(`[ ${object.option}, ${object.text} ],`);
      return;
    }
    if ('option' in object) {
      imapSearchCriteria.concat(`[ ${object.option} ],`);
    }
  });

  return `[ ${imapSearchCriteria} ]`;
};
