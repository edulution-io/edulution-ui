// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
type LmnApiGroupTypes =
  | 'schoolclass'
  | 'student'
  | 'project'
  | 'teacher'
  | 'unknown'
  | 'device'
  | 'globalbinduser'
  | 'globaladministrator'
  | 'schoolbinduser'
  | 'schooladministrator'
  | 'classroom-studentcomputer'
  | 'server'
  | 'printer';

export default LmnApiGroupTypes;
